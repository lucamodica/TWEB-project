package com.backend.servlet;

import com.backend.model.*;
import com.backend.utilities.ServerResponse;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;


/**
 * <h2>Servlet to let fetch all the content from a table.</h2>
 * It can send the following type of error <i>result</i>:
 * <ul>
 *     <li>
 *         <b>no_user</b>: none user is logged to perform
 *         this action
 *     </li>
 *     <li>
 *         <b>invalid_object</b>: an unknown table is
 *         requested
 *     </li>
 *     <li>
 *         <b>not_allowed</b>: a user us trying to fetch
 *         from a table while is not allowed
 *     </li>
 *     <li>
 *         <b>query_failed</b>: the insert query fails, due
 *         for example to syntax error.
 *     </li>
 * </ul>
 */
@WebServlet(name = "selectTable", value = "/selectTable")
public class SelectTable extends ConnectedServlet{

    //Func for selecting a table, with checks
    private static void selectTable(String query, Class<?> classType,Object... params){
        List<Object> table = dao.exc_select(query, classType,params);

        if (table == null){
            jsonResp.put("result", ServerResponse.QUERY_FAILED.toString());
        }
        else {
            jsonResp.put("result", ServerResponse.SUCCESS.toString());
            jsonResp.put("content", table);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        System.out.println("Servlet called  : selectTable ");
        //Init the HashMap for the json response
        jsonResp = new HashMap<>();

        //Retrieving session to check privileges
        HttpSession session = req.getSession(false);
        String objType = checkPrivileges(req, session,
                new String[]{"utente", "corso", "docente",
                        "affiliazione", "ripetizione"},
                new String[]{},
                true);

        //Fetch data from the selected table
        if (!objType.equals("")) {
            System.out.println("Selection of the following objType: " + objType);
            switch (objType){
                case "utente":
                    selectTable("select * from utente", User.class);
                    break;

                case "corso":
                    selectTable("select * from corso", Course.class);
                    break;

                case "docente":
                    selectTable("select * from docente", Teacher.class);
                    break;

                case "affiliazione":
                    selectTable("select * from affiliazione  join docente on " +
                            "affiliazione.teacher_id = docente.id_number", AJT.class);
                    break;

                case "ripetizione":
                    selectTable("select * from ripetizione order by status", LJT.class);
                    break;

            }
        }

        //Log print and send json response
        System.out.println(jsonResp.get("result").equals(ServerResponse.SUCCESS.toString()) ?
                "Select done of table: " + objType
                : "Table selection went wrong.");
        System.out.println();
        sendJson(resp);

    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doGet(req, resp);
    }
}
