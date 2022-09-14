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
 * <h2>
 *     Servlet to let a user to logout and then invalidate
 *     his session.
 * </h2>
 * As json error result It can be send the <b>no_user</b>
 * result, which means that a client try to logout without
 * any user logged.
 * It can send the following type of error <i>result</i>:
 * <ul>
 *     <li>
 *         <b>no_user</b>: none user is logged to perform
 *         this action
 *     </li>
 * </ul>
 */
@WebServlet(name = "logout", value = "/logout")
public class Logout extends HttpServlet {

    public void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        System.out.println("Servlet called  : Logout");

        //Setting HTTP response
        PrintWriter out = resp.getWriter();
        resp.setContentType("application/json");
        /*
          Setting hashmap to format the json response.
         */
        HashMap<String, Object> jsonResp = new HashMap<>();

        //Retrieving the session
        HttpSession session = req.getSession(false);

        //Check if session exists
        if (session == null){
            System.out.println("There was no active session.");
            jsonResp.put("result", ServerResponse.NO_USER.toString());
        }
        else {
            String username = (String) session.getAttribute("account");
            session.invalidate();
            jsonResp.put("result", ServerResponse.SUCCESS.toString());
            jsonResp.put("accountLoggedOut", username);
            System.out.println("Id session (logout): " + session.getId());
        }

        String g = new Gson().toJson(jsonResp);
        out.println(g);
        out.flush();
        out.close();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doGet(req,resp);
    }
}
