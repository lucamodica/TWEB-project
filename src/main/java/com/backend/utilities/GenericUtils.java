package com.backend.utilities;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public class GenericUtils {

    public static List<String> getLessonTimeSlots(){
        return Arrays.asList("15:00-16:00", "16:00-17:00",
                "17:00-18:00", "18:00-19:00");
    }

    public static List<String> getLessonDays(){
        return Arrays.asList("Lunedi", "Martedi",
                "Mercoledi", "Giovedi", "Venerdi");
    }

    public static List<String> getLessonStatus(){
        return Arrays.asList("attiva", "effettuata", "disdetta");
    }

    public static List<String> getUserType(){
        return Arrays.asList("utente", "amministratore");
    }
    
    public static HashMap<String, List<String>> getPrimaryKeys(){
        HashMap<String, List<String>> pk = new HashMap<>();
        pk.put("affiliazione", Arrays.asList("teacher_id", "course_title"));
        pk.put("corso", Arrays.asList("title", "desc"));
        pk.put("docente", Arrays.asList("id_number", "name", "surname"));
        pk.put("ripetizione", Arrays.asList("teahcer", "t_slot", "day", "user"));
        pk.put("utente", Collections.singletonList("account"));

        return pk;
    }

    //Func to get all the declared fields from a model
    public static List<Field> getAllFields(List<Field> fields,
                                           Class<?> type) {

        if (type.getSuperclass() != null) {
            getAllFields(fields, type.getSuperclass());
        }

        fields.addAll(Arrays.asList(type.getDeclaredFields()));
        return fields;
    }

    //Func to print generic objs
    public static void print(Object[] a){
        for (Object o : a) {
            System.out.println(o + " ");
        }
    }
}
