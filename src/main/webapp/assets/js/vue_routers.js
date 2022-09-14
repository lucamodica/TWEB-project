
//Routes list
const routes = [
    {
        path: '/login',
        name: 'login',
        component: login,
    },
    {
        path: '/',
        name: 'page_controller',
        component: page_controller,
        children: [
            {
                path: '/',
                name: 'home',
                component: home
            },
            {
                path: '/available_slots',
                name: 'available_slots',
                component: available_slots,
                props: route => (
                    {
                        mode: route.query.mode,
                        teacher: route.query.teacher,
                        course: route.query.course
                    })
            },
            {
                path: '/manage_affiliations',
                name: 'manage_affiliations',
                component: manage_affiliations
            },
            {
                path: '/manage_courses',
                name: 'manage_courses',
                component: manage_courses
            },
            {
                path: '/manage_teachers',
                name: 'manage_teachers',
                component: manage_teachers
            },
            {
                path: '/select_course_for_lesson',
                name: 'select_course_for_lesson',
                component: select_course_teacher
            },
            {
                path: '/your_lessons',
                name: 'your_lessons',
                component: your_lessons
            },
            {
                path: '/all_lessons',
                name: 'all_lessons',
                component: all_lessons
            },
        ]
    },

];

//Create VueRouter option
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});
