package com.backend.servlet;

import com.backend.model.User;
import com.backend.utilities.Crypt;
import com.backend.utilities.ServerResponse;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

/**
 * <h2>Servlet to let user login and create a session.</h2>
 * It can send the following type of error <i>result</i>:
 * <ul>
 *     <li>
 *         <b>already_logged</b>: a session from that reqeust client
 *         already exists (and so cannot repeat another login) (note:
 *         for "another login" is meant to be a user login, a guest
 *         login can be overwritten instead)
 *     </li>
 *     <li>
 *         <b>invalid_action</b>: the "action" http parameter is not
 *         correct (so nor "guest" or "auth")
 *     </li>
 *     <li>
 *         <b>illegal_credentials</b>: in case the user try to authenticate,
 *         a credential is found null or empty.
 *     </li>
 *     <li>
 *         <b>invalid_credentials</b>: the credential is not found in the
 *         db, and so is not corect.
 *     </li>
 * </ul>
 */
@WebServlet(name = "login", value = "/login")
public class Login extends ConnectedServlet {

    private static void setGuest(HttpSession session){
        Object[] credentials = new Object[]{session.getAttribute("account"),
                session.getAttribute("role")};

        if (!session.isNew() && !Arrays.stream(credentials).allMatch(Objects::isNull)) {
            jsonResp.put("result", ServerResponse.ALREADY_LOGGED.toString());
        }
        else{
            session.setMaxInactiveInterval(100);
            System.out.println("Id session (login): " + session.getId());
            session.setAttribute("role", "guest");
            jsonResp.put("result", ServerResponse.SUCCESS.toString());
            jsonResp.put("user", new User("ospite"));

            System.out.println("Guest login succesful");
        }
    }

    private static void setUser(HttpSession session, HttpServletRequest req){
        //Retrieving data from login
        String account = req.getParameter("account");
        String password = req.getParameter("password");
        System.out.println("Credentials: " + account + "(account) "
                + password + "(password)");
        //Checking if a session (of another user) already exist from the request client
        String role = (String) session.getAttribute("role");
        if (!session.isNew() && role != null && !role.equals("guest")){
            jsonResp.put("result", ServerResponse.ALREADY_LOGGED.toString());
        }
        //Integrity login credential check
        else if ( account == null || password == null ||
                account.equals("") || password.equals("")){
            session.invalidate();
            jsonResp.put("result", ServerResponse.ILLEGAL_CREDENTIALS.toString());
        }
        //Run query to try let the user log in
        else {

            List<?> l = dao.exc_select("select account,role " +
                            "from utente where account = ? " +
                            "and password = ?", User.class, account,
                    Crypt.encryptMD5(password).toUpperCase());

            if (l == null || l.isEmpty()){
                session.invalidate();
                jsonResp.put("result", ServerResponse.INVALID_CREDENTIALS.toString());
            }
            else {
                User userLogged = (User) l.get(0);
                session.setMaxInactiveInterval(100);
                jsonResp.put("result", ServerResponse.SUCCESS.toString());
                jsonResp.put("user", userLogged);

                //Session creation
                System.out.println("Id session (login): " + session.getId());
                session.setAttribute("account", account);
                session.setAttribute("role", userLogged.getRole());

                System.out.println("Login done with user: " + userLogged);
            }
        }
    }

    public void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        System.out.println("Servlet called  : Login ");
        //Retrieve session object
        HttpSession session = req.getSession();

        //Init the HashMap for the json response
        jsonResp = new HashMap<>();

        //Retrieving action (auth/guest)
        String action = req.getParameter("action");
        System.out.println("Type of login action: " + action);

        if (action == null ||
                !Arrays.asList(new String[]{"guest", "auth"}).contains(action)) {
            session.invalidate();
            System.out.println("Invalid action");
            jsonResp.put("result", ServerResponse.INVALID_ACTION.toString());
        }
        //Guest login case
        else if (action.equals("guest")){
            setGuest(session);
        }
        //User login case
        else{
            setUser(session, req);
        }

        //Log print and send json response
        System.out.println(
                jsonResp.get("result").equals(ServerResponse.SUCCESS.toString()) ?
                "Login succesful! (Role: " + session.getAttribute("role") + ")"
                : "Invalid login, something went wrong.");
        System.out.println();
        sendJson(resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doPost(req, resp);
    }
}
