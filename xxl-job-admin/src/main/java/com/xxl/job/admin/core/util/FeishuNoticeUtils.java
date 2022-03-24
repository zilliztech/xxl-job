package com.xxl.job.admin.core.util;

import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class FeishuNoticeUtils {

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    private static class Message {

        private String msg_type;

        private Content content;
    }

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    @Builder
    private static class Content {

        private String text;
    }

    public static void sendTextMessage(String webhook, String text) {

        Message message = new Message();
        message.setMsg_type("text");
        message.setContent(Content.builder().text(text).build());


        String jsonString = JacksonUtil.writeValueAsString(message);

        HttpResponse<String> stringHttpResponse = Unirest.post(webhook)
                .body(jsonString)
                .asString();

    }

}
