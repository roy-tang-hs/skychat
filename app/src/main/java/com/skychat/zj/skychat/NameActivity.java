package com.skychat.zj.skychat;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class NameActivity extends Activity {

    private Button btnJoinPrivate;
    private Button btnJoinChannel;
    private EditText txtName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_name);

        btnJoinPrivate = (Button) findViewById(R.id.btnJoinPrivate);
        btnJoinChannel = (Button) findViewById(R.id.btnJoinChannel);


        // Hiding the action bar
        getActionBar().hide();

        btnJoinChannel.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {

                    Intent intent = new Intent(NameActivity.this,
                            MainActivity.class);
                    intent.putExtra("target", "channel message");

                    startActivity(intent);

            }
        });

        btnJoinPrivate.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                Intent intent = new Intent(NameActivity.this,
                        MainActivity.class);
                intent.putExtra("target", "private message");

                startActivity(intent);
            }
        });
    }
}