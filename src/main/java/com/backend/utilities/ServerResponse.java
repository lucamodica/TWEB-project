package com.backend.utilities;

import java.util.Locale;

public enum ServerResponse {

    //Common server responses
    SUCCESS,
    NO_USER,
    INVALID_OBJECT,
    NOT_ALLOWED,
    PARAMS_NULL,
    ILLEGAL_PARAMS,
    QUERY_FAILED,

    //Responses for CheckSession servlet
    LOGGED,
    NOT_LOGGED,

    //Responses for Delete servlet
    STILL_IN_LESSONS,

    //Responses for Insert servlet
    INVALID_CHECKS,
    INVALID_COURSE_TEACHER_FOR_LESSON,
    SLOT_BUSY,

    //Responses for Login servlet
    ALREADY_LOGGED,
    INVALID_ACTION,
    ILLEGAL_CREDENTIALS,
    INVALID_CREDENTIALS,

    //Rsponses for UpdateLessonStatus servlet
    INVALID_NEW_STATUS;

    @Override
    public String toString() {
        return super.toString().toLowerCase(Locale.ROOT);
    }
}
