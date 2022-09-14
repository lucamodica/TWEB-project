
let select_course_teacher = {
    mixins: [globals, validations_funcs],
    template:
        `
        <div id="select_course_for_lesson">
            <div class="container">
                <!-- Title row -->  
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center mt-5 pt-5 pb-4">
                    <h2>Crea Ripetizione</h2>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Subtitle row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-4">
                    <h4>{{subtitle}}</h4>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Selector row -->
                <div class="row">
                    <div class="col-2"></div>
                    
                    <!-- Dropdown list -->
                    <div class="col-8 text-center">
                       <!-- Select course -->
                       <form class="needs-validation"   
                       v-if="this.selectingCourse">
                           <div v-if="courses.isEmpty()" class="pb-3">
                                {{warnMsg}}
                           </div>
                           <div v-else class="form-group">
                                <label for="course" class=" h4 col-form-label"><h5>Corsi:</h5></label>
                                <select class="form-control" id="course" required>
                                    <option selected></option>
                                    <option v-for="course in courses.items">
                                        {{course.title}}
                                    </option>
                                </select>
                                <div class="invalid-feedback">
                                        Inserire un corso.
                                </div>
                           </div>
                       </form>
                       <!-- Select teacher -->
                       <form class="needs-validation" v-else>
                           <div v-if="teachers.isEmpty()" class="pb-3">
                                {{warnMsg}}
                           </div>
                           <div v-else class="form-group">
                               <label for="teacher" class="col-form-label"><h5>Docenti:</h5></label>
                               <select class="form-control" id="teacher" required>
                                   <option selected></option>
                                   <option v-for="teacher in teachers.items" :value="teacher.teacher_id">
                                       {{teacher.name}} {{teacher.surname}} ({{teacher.teacher_id}})
                                   </option>
                               </select>
                               <div class="invalid-feedback">
                                       Inserire un docente.
                               </div>
                           </div>
                       </form>
                       
                       <!-- Back button --> 
                       <button class="btn btn-danger ml-1 p-3 mx-3" @click="back()"
                          v-show="!this.selectingCourse && teachers.resultJsonFetch === 'success'"> 
                          Indietro
                       </button>
                       <!-- Next button --> 
                       <button class="btn btn-primary mr-1 p-3 mx-3"
                        :class="{'d-none': (!this.selectingCourse && teachers.isEmpty()) ||
                            (this.selectingCourse && courses.isEmpty())}"
                        @click="isValidated = validate_fields($event), 
                        next()">
                          Avanti
                       </button>
                    </div>
                    
                    <div class="col-2"></div>
                </div>
            </div>
        </div>
        `,

    data() {
      return {
          selectingCourse: true,
          warnMsg: "Attendere...",
          courses: {
              items: [],
              resultJsonFetch: "",
              isEmpty(){
                  return this.items.length === 0;
              }
          },
          teachers: {
              items: [],
              resultJsonFetch: "",
              isEmpty(){
                  return this.items.length === 0;
              }
          },
          selectedCourse: "",
          selectedTeacher: ""
      }
    },

    computed: {
        subtitle(){
            if (this.selectingCourse){
                return "Seleziona il corso";
            }
            return "Seleziona il docente";
        }
    },

    methods:{
        back(){
            this.selectingCourse = true;
            this.teachers.items.splice(0, this.teachers.items.length);
            this.selectedCourse = '';
            this.teachers.resultJsonFetch = '';
        },
        next(){
            let self = this;
            if(self.isValidated){
                if (self.selectingCourse){
                    self.selectedCourse = $("#course").val();
                    self.selectedTeacher = '';
                    self.teachers.items.splice(0, self.teachers.items.length);
                    self.selectingCourse = false;
                    self.fetchTeachers(this.selectedCourse);
                }
                else {
                    self.selectedTeacher = $("#teacher").val();
                    router.push({ name: 'available_slots',
                        query: {
                            mode: 'lessonSlots',
                            teacher: self.selectedTeacher,
                            course: self.selectedCourse
                        } })
                }
            }
        },

        fetchCourses(){
            let self = this;

            self.teachers.items.splice(0, self.teachers.items.length);
            $.get('selectTable', {objType: "corso"}, function (data) {

                let jsonResponse = JSON.parse(JSON.stringify(data));
                self.courses.resultJsonFetch = jsonResponse.result;
                console.log(jsonResponse);

                self.warnMsg = "Attendere...";
                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success"){
                    if (jsonResponse.content.length === 0){
                        self.warnMsg = "Nessun corso disponibile.";
                    }
                    else {
                        jsonResponse.content.forEach(item =>
                            self.courses.items.push(item)
                        );
                    }
                }

            })
        },
        fetchTeachers(course){
            let self = this;

            self.warnMsg = "Attendere...";
            $.get('selectElems', {objType: "affiliazione", course_title: course}, function (data) {

                let jsonResponse = JSON.parse(JSON.stringify(data));
                self.teachers.resultJsonFetch = jsonResponse.result;
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success"){
                    if (jsonResponse.content.length === 0){
                        self.warnMsg = "Nessun docente disponibile per la materia: " +
                            self.selectedCourse;
                    }
                    else {
                        jsonResponse.content.forEach(item =>
                            self.teachers.items.push(item)
                        );
                    }
                }
            });
        }
    },

    created() {
        //Fetch all courses
        let self = this;
        self.fetchCourses();
    }
}