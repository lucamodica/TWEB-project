package com.backend.utilities;

import org.apache.commons.codec.digest.DigestUtils;

public class Crypt {

    //Functions with MD5 encrypt mode
    public static String encryptMD5(String inputText){
        return DigestUtils.md5Hex(inputText).toUpperCase();
    }
    public static boolean checkMD5(String password, String inputText){
        return password.equals(encryptMD5(inputText).toUpperCase());
    }

}
