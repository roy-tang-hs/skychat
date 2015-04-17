package com.skychat.zj.skychat;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Toast;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.skychat.zj.other.LoadMessage;
import com.skychat.zj.other.Message;


import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;



public class MainActivity extends Activity {

    private Button btnSend;
    private EditText inputMsg;

    private String username = "tangree";
    private int user_id = 13122;
    private int recipientId = 31806;
    private String avatar = "http://skycitizencdn-1272.kxcdn.com/avatar/1-g2.jpg";

    // Chat messages list adapter
    private MessagesListAdapter adapter;
    private List<Message> listMessages;
    private ListView listViewMessages;

    private String target = null;

    //AJAX
    private String baseURL = "http://www.skycitizen.net/";



    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("http://54.169.49.211:8080?" +
                    "username=" + username
                    +"&userid=" + user_id
                    +"&avatar=" + avatar);

        } catch (URISyntaxException e) {}
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Getting the person name from previous screen
        Intent i = getIntent();
        Bundle b = i.getExtras();
        final String target = b.getString("target");

        Log.d("Target",target);

        mSocket.on(target, onNewMessage);


        mSocket.connect();

        // ajax call to send message Use: droidQuery
        //  $.ajax(new AjaxOptions().url(baseURL + "api/chat/post/user/"+recipientId)

        if (target.equals("channel message"))
        {
            recipientId = 6;
            JSONObject joinChat = new JSONObject();
            try {
                joinChat.put("roomid",recipientId);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            mSocket.emit("join channel", joinChat);

            LoadMessage history = new LoadMessage();
            String response = null;
            try {
                response = history.run("http://www.skycitizen.net/api/chat/get/channel/6");
            } catch (IOException e) {
                e.printStackTrace();
            }
            System.out.println(response);
        }

        Log.i("recipientId","Value" + recipientId);

        btnSend = (Button) findViewById(R.id.btnSend);
        inputMsg = (EditText) findViewById(R.id.inputMsg);
        listViewMessages = (ListView) findViewById(R.id.list_view_messages);

        btnSend.setOnClickListener(new View.OnClickListener() {
//            TODO: get ox and send pic
            @Override
            public void onClick(View v) {
                String msg = inputMsg.getText().toString();
                JSONObject msgObj = null;
                try {
                    JSONObject jObj = new JSONObject();
                   // JSONObject ox = new JSONObject();
                    jObj.put("senderId",user_id);
                    jObj.put("senderName",username);
                    jObj.put("senderAvatar",avatar);
                    jObj.put("type",100);
                    jObj.put("content",msg);
                    jObj.put("user_ox",0);
                    jObj.put("user_ox_style","shield-grey");
                    jObj.put("recipientId",recipientId);
                    msgObj = jObj;
                }catch (JSONException e){
                    e.printStackTrace();
                }

                if (msg != null) {
                   inputMsg.setText("");
                   Log.d("ActivityName: ", "socket connected");
                   mSocket.emit(target, msgObj);
                   Log.w("myApp", msgObj.toString());

                }
                else{
                    inputMsg.setText("");
                    Toast.makeText(getApplicationContext(), "Empty", Toast.LENGTH_SHORT).show();
                }
//                inputMsg.setText("");

            }
        });

        listMessages = new ArrayList<Message>();

        adapter = new MessagesListAdapter(this, listMessages);
        listViewMessages.setAdapter(adapter);




    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        mSocket.disconnect();

        target = getIntent().getExtras().getString("target");
        Log.d("Target Destory",target);
        mSocket.off(target, onNewMessage);
    }


//todo: update view, append list
    private Emitter.Listener onNewMessage = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    JSONObject data = (JSONObject) args[0];
                    Log.d("Message",data.toString());
                    try {

                        showToast(data.getString("senderId"));
                        String fromName = data.getString("senderName");

                        String message = data.getString("content");

                        showToast(fromName + " + " + message);

//                        Message m = new Message(fromName, message, true);
//                        appendMessage(m);

                        Message m = new Message(fromName, message, false);

                        // Appending the message to chat list
                        appendMessage(m);

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }


                }
            });
        }
    };


    private void showToast(final String message) {

        runOnUiThread(new Runnable() {

            @Override
            public void run() {
                Toast.makeText(getApplicationContext(), message,
                        Toast.LENGTH_LONG).show();
            }
        });

    }


    private void appendMessage(final Message m) {
        runOnUiThread(new Runnable() {

            @Override
            public void run() {
                listMessages.add(m);

                adapter.notifyDataSetChanged();

            }
        });
    }
}
