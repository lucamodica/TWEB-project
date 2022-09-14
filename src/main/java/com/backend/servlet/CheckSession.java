package com.backend.servlet;

import com.backend.utilities.ServerResponse;
import com.google.gson.Gson;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;

/**
 * <h2>Servlet to check if a session is active.</h2>
 * The json result will be <b>not_logged</b> or
 * <b>logged</b>, based on the case.
 */
@WebServlet(name = "checkSession", value = "/checkSession")
public class CheckSession extends HttpServlet {

    public void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        System.out.println("Servlet called  : CheckSession");

        //Init the HashMap for the json response
        PrintWriter out = resp.getWriter();
        resp.setContentType("application/json");
        HashMap<String, Object> jsonResp = new HashMap<>();

        //Retrieving the session
        HttpSession session = req.getSession(false);

        //Check if session exists
        System.out.println("Checking session...");
        if (session == null){
            System.out.println("There was no active session.");
            jsonResp.put("result", ServerResponse.NOT_LOGGED.toString());
        }
        else {
            jsonResp.put("result", ServerResponse.LOGGED.toString());
            System.out.println("Id session: " + session.getId());
        }
        System.out.println();

        String g = new Gson().toJson(jsonResp);
        out.println(g);
        out.flush();
        out.close();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doGet(req, resp);
    }
}
