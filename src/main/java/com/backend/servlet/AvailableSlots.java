package com.backend.servlet;

import com.backend.model.AJT;
import com.backend.model.Lesson;
import com.backend.utilities.GenericUtils;
import com.backend.utilities.ServerResponse;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <h2>
 *     Servlet to retrieve all the free slots to
 *     book a lesson.
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
 *         <b>not_allowed</b>: a user is trying to fetch
 *         from a table while is not allowed
 *     </li>
 *     <li>
 *         <b>params_null</b>: some of the params are
 *         null or empty.
 *     </li>
 *     <li>
 *         <b>query_failed</b>: one of the 2 necessary
 *         select query fails, due for example to syntax
 *         error or item not existing, or even the connection
 *         is not available.
 *     </li>
 * </ul>
 */
@WebServlet(name = "availableSlots", value = "/availableSlots")
public class AvailableSlots extends ConnectedServlet{

    //Internal class to create and represent a slot
    static private class Slot{
        String time_slot;
        String id_number;
        String teacher_name;
        String teacher_surname;
        String course;

        public Slot(String time_slot, String id_number, String t_name, String t_surname, String course) {
            this.time_slot = time_slot;
            this.id_number = id_number;
            this.teacher_name = t_name;
            this.teacher_surname = t_surname;
            this.course = course;
        }

        public String getTime_slot() {
            return time_slot;
        }

        public void setTime_slot(String time_slot) {
            this.time_slot = time_slot;
        }

        public String getTeacher_name() {
            return teacher_name;
        }

        public void setTeacher_name(String teacher_name) {
            this.teacher_name = teacher_name;
        }

        public String getTeacher_surname() {
            return teacher_surname;
        }

        public void setTeacher_surname(String teacher_surname) {
            this.teacher_surname = teacher_surname;
        }

        public String getCourse() {
            return course;
        }

        public void setCourse(String course) {
            this.course = course;
        }

        public String getId_number() {
            return id_number;
        }

        public void setId_number(String id_number) {
            this.id_number = id_number;
        }

        @Override
        public String toString() {
            return "Slot{" +
                    "time_slot='" + time_slot + '\'' +
                    ", id_number='" + id_number + '\'' +
                    ", t_name='" + teacher_name + '\'' +
                    ", t_surname='" + teacher_surname + '\'' +
                    ", course='" + course + '\'' +
                    '}';
        }
    }

    //Filter slots by removing the busy slots
    static private boolean filterByLessons(HashMap<String, List<Slot>> slots){

        System.out.println("Fetching lessons to be removed from free slots...");
        List<Object> lessons = dao.exc_select("select * from ripetizione", Lesson.class);
        boolean isDone = true;

        if (lessons == null){
            jsonResp.put("result", ServerResponse.QUERY_FAILED.toString());
            isDone = false;
        }
        else if (!lessons.isEmpty()){
            System.out.println("Lessons fetching, done");

            //Filering to remove all slots that is in the
            //lesson table
            System.out.println("Filtering by lessons " +
                    "already occupied");
            for (Object lesson : lessons) {
                Lesson l = (Lesson) lesson;

                if (!l.getStatus().equals("disdetta")){
                    List<Slot> daySlots = slots.get(l.getDay());

                    System.out.println(l.getDay() + ": " + daySlots);
                    daySlots.removeIf(slot -> slot.getTime_slot().equals(l.getT_slot()) &&
                            slot.getId_number().equals(l.getTeacher()));
                }
            }

            System.out.println("Slots successfully filtered by lessons " +
                    "already occupied");
        }

        return isDone;
    }

    //Filter slots by teacher and/or course
    static private void filterByTeacherCourse(HashMap<String, List<Slot>> slots,
                                              String teacher, String course){

        System.out.println("Filtering by:" + teacher + " that teach the course " + course);
        for (Map.Entry<String, List<Slot>> entry : slots.entrySet()) {
            List<Slot> daySlot = entry.getValue();

            if (teacher != null) {
                daySlot.removeIf(slot -> !slot.getId_number().equals(teacher));
            }

            if (course != null) {
                daySlot.removeIf(slot -> !slot.getCourse().equals(course));
            }

            System.out.println("Slots successfully filtered by the course " +
                    "and the teacher inserted");
        }

        System.out.println(slots);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        System.out.println("Servlet called: availableSlots");

        //Init the HashMap for the json response
        jsonResp = new HashMap<>();

        //Retrieving session to check privileges
        HttpSession session = req.getSession(false);
        String objType = checkPrivileges(req, session,
                new String[]{"slots", "lessonSlots"}, new String[]{},
                true);

        //Check for objType result
        if (!objType.equals("")) {

            //Retrieving all affiliation with teacher name and surname
            System.out.println("Fetching affiliation...");
            List<Object> affs = dao.exc_select("select * from affiliazione  join docente on " +
                    "affiliazione.teacher_id = docente.id_number", AJT.class);
            if (affs == null || affs.isEmpty()){
                System.out.println("Something went wrong with affiliation fetch");
                jsonResp.put("result", "query_failed");
            }
            else {
                System.out.println("Affiliation fetch, done");

                //Creation of HashMap with all possible repetition
                HashMap<String, List<Slot>> slots = new HashMap<>();
                for (String day : GenericUtils.getLessonDays()) {
                    slots.put(day, new ArrayList<>());

                    for (String time : GenericUtils.getLessonTimeSlots()) {
                        for (Object aff : affs) {
                            AJT ajt = (AJT) aff;
                            slots.get(day).add(new Slot(time, ajt.getTeacher_id(),
                                    ajt.getName(), ajt.getSurname(), ajt.getCourse_title()));
                        }
                    }
                }

                //Filter the slots
                if (filterByLessons(slots) && objType.equals("lessonSlots")){
                    String teacher = req.getParameter("teacher");
                    String course = req.getParameter("course");
                    if (course != null || teacher != null) {
                        filterByTeacherCourse(slots, teacher, course);
                    }
                    else {
                        System.out.println("The slots filter params are null!");
                        jsonResp.put("result", ServerResponse.PARAMS_NULL.toString());
                    }
                }

                System.out.println("slot: " + slots);
                jsonResp.put("result", "success");
                jsonResp.put("slots", slots);
            }

        }

        //Log print and send json response
        System.out.println(jsonResp.get("result").equals(ServerResponse.SUCCESS.toString()) ?
                "Selection of available slots, done!"
                : "Selection of available slots went wrong.");
        System.out.println();
        sendJson(resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        doGet(req, resp);
    }
}
