package com.backend.servlet;

import com.backend.model.*;
import com.backend.utilities.Crypt;
import com.backend.utilities.GenericUtils;
import com.backend.utilities.ServerResponse;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.*;
import java.util.regex.Pattern;

/**
 * <h2>Servlet to insert a row in a table.</h2>
 * It can send the following type of error <i>result</i>:
 * <ul>
 *     <li>
 *         <b>no_user</b>: no user is logged to perform
 *         this action.
 *     </li>
 *     <li>
 *         <b>invalid_object</b>: an unknown table is
 *         requested.
 *     </li>
 *     <li>
 *         <b>not_allowed</b>: a user us trying to fetch
 *         from a table while is not allowed.
 *     </li>
 *     <li>
 *         <b>illegal_params</b>: the required params are null
 *         or empty.
 *     </li>
 *     <li>
 *         <b>invalid_checks</b>: some params violates integrity
 *         checks.
 *     </li>
 *     <li>
 *         <b>query_failed</b>: the insert query fails, due
 *         for example to syntax error or item already exists.
 *     </li>
 *     <li>
 *         <b>invalid_course_teacher_for_lesson</b>: the course
 *         and the teacher requested are not found tegether in
 *         an affiliation.
 *     </li>
 *     <li>
 *         <b>slot_busy</b>: the lesson requested is already
 *         occupied.
 *     </li>
 * </ul>
 */
@WebServlet(name = "insert", value = "/insert")
public class Insert extends ConnectedServlet{

    //Func to check the affiliation
    private static AJT checkAff(Lesson l){
        AJT aff = null;

        System.out.println("Checking the affiliation of the new lesson (" + l.getTeacher()
                + " -- " + l.getCourse() + ")...");
        List<Object> checkAff = dao.exc_select("select * from affiliazione " +
                        "join docente on affiliazione.teacher_id = docente.id_number " +
                        "where teacher_id = ? and course_title = ?", AJT.class,
                l.getTeacher(), l.getCourse());

        System.out.println("Affiliation check result " + checkAff);
        if (checkAff != null && checkAff.size() == 1){
            aff = (AJT) checkAff.get(0);
            System.out.println("The affiliation exists.");
        }

        return aff;
    }

    //Func to check if a slot is busy
    //0 = free
    //1 = free but row already registered
    //2 = busy
    private static int checkSlotFree(Lesson l){
        System.out.println("Checking if the slot requested is already busy...");
        int result = 2;

        System.out.println("We start from t_slot and day...");
        List<Object> busySlot = dao.exc_select("select * from " +
                "ripetizione where t_slot=? and day=?",
                LJT.class, l.getT_slot(), l.getDay());

        System.out.println("Slots found: " + busySlot);
        if (busySlot != null) {
            if (busySlot.isEmpty()){
                System.out.println("None slots found! It's yours then");
                result = 0;
            }
            else{
                LJT[] slots = Arrays.stream(busySlot.toArray()).map(s -> (LJT) s).toArray(LJT[]::new);

                //Check for the teacher
                System.out.println("...followed by the teacher and the user...");
                if (Arrays.stream(slots).noneMatch(s ->
                        (s.getUser().equals(l.getUser()) ||
                                s.getTeacher().equals(l.getTeacher()))
                        && !s.getStatus().equals("disdetta"))){

                    System.out.println("Good good, neither the teacher nor the user " +
                            "are occupied");
                    if (Arrays.stream(slots).anyMatch(s ->
                            s.getStatus().equals("disdetta") &&
                                    s.getUser().equals(l.getUser()) &&
                                    s.getTeacher().equals(l.getTeacher()))) {
                        System.out.println("Plus there's a row to be updated");
                        result = 1;
                    }
                    else {
                        System.out.println("A row to be inserted eheh");
                        result = 0;
                    }
                }
                else {
                    System.out.println("Ouch! Either the teacher or the " +
                            "user itself is already occupied at that time!");
                }
            }
        }
        System.out.println("Slot status " + ((result == 0 || result == 1) ? "free" : "busy"));

        return result;
    }

    //Specific func to create a new lesson, with all
    // to controls to check if the inserted affiliation
    // exist or if the slot is busy
    private static Object createLesson(Lesson l){

        Object lessonInserted = null;

        //Var integral check
        if (!Lesson.checks(l)){
            jsonResp.put("result", "invalid_checks");
        }
        else {
            System.out.println("Lesson initial checks, done");

            //Check if the affiliation teacher -- course exists
            AJT aff = checkAff(l);
            if (aff == null){
                jsonResp.put("result", ServerResponse.
                        INVALID_COURSE_TEACHER_FOR_LESSON.toString());
            }
            else {
                //Check if the slot is busy
                int checkFree = checkSlotFree(l);
                if (checkFree == 2){
                    jsonResp.put("result", ServerResponse.SLOT_BUSY.toString());
                }
                else {
                    LJT lesson = new LJT(l, aff.getName(), aff.getSurname());
                    System.out.println("Lesson to be added: " + lesson);

                    if (checkFree == 1){
                        //Update lesson status to "attiva"
                        int updateResult = dao.exc_update("update ripetizione " +
                                        "set status='attiva', course=? " +
                                        "where teacher=? and t_slot=? and day=? and user=?",
                                l.getCourse(),
                                l.getTeacher(), l.getT_slot(), l.getDay(), l.getUser());

                        if (updateResult != 1){
                            jsonResp.put("result", ServerResponse.QUERY_FAILED.toString());
                        }
                        else {
                            lessonInserted = lesson;
                        }
                    }
                    else {
                        //Inserting lesson
                        lessonInserted = insertEntry("insert into ripetizione " +
                                        "values(?,?,?,?,?,?,?,?)",
                                lesson, true);
                    }
                }

            }

        }

        return lessonInserted;
    }

    //Funcs for inserting the entry
    private static Object insertEntry(String query, Object obj, Boolean... checks){
        Object objInserted = null;

        //Fetch all params
        List<String> params = new ArrayList<>();
        for (Field field : GenericUtils.getAllFields(new ArrayList<>(), obj.getClass())) {
            field.setAccessible(true);
            Object value = null;
            try {
                value = field.get(obj);
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
            if (value != null) {
                System.out.println(field + ": " + value);
                params.add((String) value);
            }
        }

        //Check null/empty values
        if (Arrays.stream(params.toArray()).anyMatch(param ->
                (param == null) || param.equals(""))){
            jsonResp.put("result", ServerResponse.ILLEGAL_PARAMS.toString());
        }
        //Check for checks and query result
        else if (Arrays.stream(checks).noneMatch(check -> check)){
            jsonResp.put("result", ServerResponse.INVALID_CHECKS.toString());
        }
        else if (dao.exc_insert(query, params.toArray()) != 1){
            jsonResp.put("result", ServerResponse.QUERY_FAILED.toString());
        }
        else {
            objInserted = obj;
        }

        return objInserted;
    }


    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws IOException {
        System.out.println("Servlet called  : Insert");
        //Init the HashMap for the json response
        jsonResp = new HashMap<>();

        //Retrieving user table in which we want to insert,
        //with privileges checked
        HttpSession session = req.getSession(false);
        String objType = checkPrivileges(req, session,
                new String[]{"utente", "corso",
                        "docente", "affiliazione", "ripetizione"},
                new String[]{"utente", "corso", "docente", "affiliazione"},
                false);
        System.out.println("Type of object: " + objType);

        Object obj = null;
        //Insert the object, with specific parameters checks
        if (!objType.equals("")){
            switch (objType){
                case "utente":
                    User user = new User(req.getParameter("account"),
                            Crypt.encryptMD5(req.getParameter("password")),
                            req.getParameter("role"));
                    obj = insertEntry("insert into utente values(?,?,?)", user,
                            GenericUtils.getUserType().contains(user.getRole()));
                    user.setPassword("");
                    break;

                case "corso":
                    Course course = new Course(req.getParameter("title"),
                            req.getParameter("desc"));
                    obj = insertEntry("insert into corso values(?,?)", course, true);
                    break;

                case "docente":
                    Teacher teacher = new Teacher(req.getParameter("id_number"),
                            req.getParameter("name"),
                            req.getParameter("surname"));
                    obj = insertEntry("insert into docente values(?,?,?)", teacher,
                            Pattern.matches("[0-9]+", teacher.getId_number()));
                    break;

                case "affiliazione":
                    Affilation affilation = new Affilation(req.getParameter("teacher_id"),
                            req.getParameter("course_title"));
                    obj = insertEntry("insert into affiliazione values(?,?)", affilation,
                            Pattern.matches("[0-9]+", affilation.getTeacher_id()));
                    break;

                case "ripetizione":
                    Lesson lesson = new Lesson(req.getParameter("teacher"),
                            req.getParameter("t_slot"), req.getParameter("day"),
                            "attiva", req.getParameter("user"),
                            req.getParameter("course"));
                    obj = createLesson(lesson);
                    break;
            }

            if(!jsonResp.containsKey("result")){
                jsonResp.put("result", ServerResponse.SUCCESS.toString());
                jsonResp.put("obj", obj);
            }
        }

        //Log print and send json response
        System.out.println(
                jsonResp.get("result").equals(ServerResponse.SUCCESS.toString()) ?
                "Insert done with object: " + obj
                : "Invalid objType, or it's null, or something went wrong.");
        System.out.println();
        sendJson(resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doPost(req, resp);
    }
}
