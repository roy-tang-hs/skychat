package com.skychat.zj.other;

import java.util.HashMap;
import java.util.Map;


public class ChannelHistoryData {

    private Integer senderId;
    private String senderName;
    private String senderAvatar;
    private Integer type;
    private String content;
    private Integer userOx;
    private String userOxStyle;
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     *
     * @return
     * The senderId
     */
    public Integer getSenderId() {
        return senderId;
    }

    /**
     *
     * @param senderId
     * The senderId
     */
    public void setSenderId(Integer senderId) {
        this.senderId = senderId;
    }

    /**
     *
     * @return
     * The senderName
     */
    public String getSenderName() {
        return senderName;
    }

    /**
     *
     * @param senderName
     * The senderName
     */
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    /**
     *
     * @return
     * The senderAvatar
     */
    public String getSenderAvatar() {
        return senderAvatar;
    }

    /**
     *
     * @param senderAvatar
     * The senderAvatar
     */
    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }

    /**
     *
     * @return
     * The type
     */
    public Integer getType() {
        return type;
    }

    /**
     *
     * @param type
     * The type
     */
    public void setType(Integer type) {
        this.type = type;
    }

    /**
     *
     * @return
     * The content
     */
    public String getContent() {
        return content;
    }

    /**
     *
     * @param content
     * The content
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     *
     * @return
     * The userOx
     */
    public Integer getUserOx() {
        return userOx;
    }

    /**
     *
     * @param userOx
     * The user_ox
     */
    public void setUserOx(Integer userOx) {
        this.userOx = userOx;
    }

    /**
     *
     * @return
     * The userOxStyle
     */
    public String getUserOxStyle() {
        return userOxStyle;
    }

    /**
     *
     * @param userOxStyle
     * The user_ox_style
     */
    public void setUserOxStyle(String userOxStyle) {
        this.userOxStyle = userOxStyle;
    }

    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}
