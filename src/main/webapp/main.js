
//App creation
const app = Vue.createApp({
    mixins: [globals],
    components: {
        'login': login,
        'page_controller': page_controller,
        'home': home,
        'available_slots': available_slots,
        'manage_affiliations': manage_affiliations,
        'manage_courses': manage_courses,
        'manage_teachers': manage_teachers,
        'select_course_for_lesson': select_course_teacher,
        'your_lessons': your_lessons,
        'all_lessons': all_lessons
    },
    created() {
        //Tooltips activation
        $("body").tooltip({ selector: '[data-toggle=tooltip]' });
        $('[data-toggle="tooltip"]').tooltip({
            trigger : 'hover'
        });

        //Reset modals
        $('body').on('hidden.bs.modal', '.modal', function () {
            $(".form-control").val("");
            $(".needs-validation").removeClass("was-validated");
        });


        this.checkSession();
    }
})

//NAvbar is globally registered, so other components can use it
app.component('navbar', navbar);

//Seting the use of routers into the app
app.use(router);



