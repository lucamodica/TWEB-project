package com.backend.servlet;

import com.backend.model.*;
import com.backend.utilities.GenericUtils;
import com.backend.utilities.ServerResponse;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * <h2>
 *     Servlet to let fetch the content from a table, based on
 *     some filter criteria.
 * </h2>
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
 *         <b>query_failed</b>: the select query fails, due
 *         for example to syntax error.
 *     </li>
 * </ul>
 */
@WebServlet(name = "selectElems", value = "/selectElems")
public class SelectElems extends ConnectedServlet{

    //Func for selecting a table, with checks
    private static void selectTable(String query, HttpServletRequest req,
                                    Class<?> classType){

        //Fetch all param names
        List<Field> fields = GenericUtils.getAllFields(new ArrayList<>(), classType);
        System.out.println(fields);
        List<String> paramValues = new ArrayList<>();
        StringBuilder queryBuilder = new StringBuilder(query).append(" where ");
        for (Field field : fields) {
            int mid = String.valueOf(field).lastIndexOf('.')+1;
            String f = String.valueOf(field).substring(mid);
            String param = req.getParameter(f);
            if (param != null){
                queryBuilder.append(f).append("=? and ");
                paramValues.add(param);
            }
        }
        query = queryBuilder.toString().replaceAll("and $", " ");

        List<Object> table;
        if (paramValues.isEmpty()) {
            table = dao.exc_select(query, classType);
        }
        else{
            table = dao.exc_select(query, classType, paramValues.toArray());
        }


        if (table == null){
            jsonResp.put("result", ServerResponse.QUERY_FAILED.toString());
        }
        else {
            jsonResp.put("result", ServerResponse.SUCCESS.toString());
            jsonResp.put("content", table);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws
            IOException {
        System.out.println("Servlet called  : selectElems");
        //Init the HashMap for the json response
        jsonResp = new HashMap<>();

        //Retrieving session to check privileges
        HttpSession session = req.getSession(false);
        String objType = checkPrivileges(req, session,
                new String[]{"utente", "corso", "docente",
                        "affiliazione", "ripetizione", "archivio"},
                new String[]{""}, false);

        if (!objType.equals("")) {
            switch (objType){
                case "utente":
                    selectTable("select * from utente ", req, User.class);
                    break;

                case "corso":
                    selectTable("select * from corso", req, Course.class);
                    break;

                case "docente":
                    selectTable("select * from docente", req, Teacher.class);
                    break;

                case "affiliazione":
                    selectTable("select * from affiliazione join docente on " +
                                    "affiliazione.teacher_id = docente.id_number", req,
                            AJT.class);
                    break;

                case "ripetizione":
                    selectTable("select * from ripetizione", req, LJT.class);
                    break;

            }
        }

        //Log print and send json response
        System.out.println(
                jsonResp.get("result").equals(ServerResponse.SUCCESS.toString()) ?
                "Selection of the following elements done: "
                : "Invalid objType, or it's null, or something went wrong.");
        System.out.println();
        sendJson(resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doGet(req, resp);
    }
}
