
let available_slots = {
    mixins: [globals, warning_messages],
    template:
        `
        <div id="available_slots">
            <div class="container py-5">
                <!-- Title row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pt-4 pb-4">
                    <h2>Slot disponibili</h2>
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
                
                <!-- Free slots row -->
                <div class="row">
                  <!-- Notifiation area -->
                  <div class="col-2">
                    <!-- Waiting Alert -->
                    <div class="alert alert-secondary alert_notify m-3"
                        role="alert" v-show="isWaitingNotify">
                        Attendere...
                    </div>
                    <!-- Alert create success -->
                    <div class="alert alert_notify m-3"
                        :class="{'alert-success': book_info.resultJsonBook === 'success', 
                        'alert-danger': book_info.resultJsonBook !== 'success'}"
                        role="alert" v-show="book_info.isActionBook"
                        v-html="warnMsgBook">
                        
                    </div>
                  </div>
                  
                  <!-- Free slots tables -->
                  <div class="col-8 text-center pb-5">
                    <div v-if="resultJsonFetch == 'success'">
                        <div v-if="isEmpty()" class="pb-3">
                            Nessuno slot presente.
                        </div>
                        <div v-else>
                        
                            <table class="table table-striped" 
                            v-for="item in items">
                                <caption style="caption-side: top;">
                                    <b><u>{{item.day}}</u></b>
                                </caption>
                                
                                <thead>
                                    <tr>
                                        <th scope="col">Orario</th>
                                        <th scope="col">Docente</th>
                                        <th scope="col">Corso</th>
                                        <th scope="col" 
                                        v-show="mode === 'lessonSlots' && 
                                        profile.role !== 'ospite'"></th>
                                    </tr>
                                </thead>
                                    
                                <tbody>
                                    <tr v-for="(slot, index) in item.slots">
                                        <td>{{slot.time_slot}}</td>
                                        <td>
                                            {{slot.teacher_name}} {{slot.teacher_surname}} 
                                            ({{slot.id_number}})
                                        </td>
                                        <td>{{slot.course}}</td>
                                        <td>
                                            <button class="btn btn-primary align-content-between" 
                                            @click="bookSlot(item.day, slot, index)"
                                            v-show="mode === 'lessonSlots' && 
                                            profile.role !== 'ospite'">
                                                <i class="ri-calendar-check-fill ri-lg"></i> Prenota
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                        </div>
                    </div>
                    <div v-else>{{warnMsgFetch}}</div>
                  </div>
                  
                  <div class="col-2"></div>
                </div>
            </div>
        </div>
        `,

    data() {
        return {
            items: [],
            isEmpty(){
                return this.items.length === 0;
            },
            book_info: {
                isActionBook: false,
                resultJsonBook: "",
            },
        }
    },

    created(){
        let self = this;
        self.fetchSlots();
    },

    computed: {
        subtitle(){
            if (this.mode === 'slots'){
                return "Ecco a te tutti gli slot liberi";
            }
            else if(this.mode === 'lessonSlots'){
                return "Ecco a te tutti gli slot che puoi prenotare";
            }
            return "";
        },
        warnMsgBook(){
            let self = this;
            switch (self.book_info.resultJsonBook){

                case "success":
                    return "Slot prenotato!";

                case "no_user":
                    return "Errore, si sta cercando di prenotare <br>" +
                        "mentre nessun utente è attivo.";

                case "invalid_object":
                    return "Errore, si sta cercando di creare <br>" +
                        "un oggetto di tipo sconosciuto.";

                case "not_allowed":
                    return "Errore, l'utente non ha il permesso di " +
                        "prenotare uno slot.";

                case "illegal_params":
                    return "Errore, alcuni valori nulli o mancanti!";

                case "invalid_check":
                    return "Errore, alcuni valori inseriti non sono validi!";

                case "query_failed":
                    return "Errore di connessione o richiesta, <br>" +
                        "l'oggetto potrebbe gia esistere!";

                case "invalid_course_teacher_for_lesson":
                    return "Errore, la combinazione corso <--> docente <br>" +
                        "selezionata non esiste.";

                case "slot_busy":
                    return "Errore, lo slot selezionato risulta<br>" +
                        "gia pieno o gia impegnato dall'utente/docente!"

                default:
                    return "Attendere...";
            }
        }
    },

    methods: {
        numDay(day){
          switch (day) {
              case 'Lunedi': return 0;
              case 'Martedi': return 1;
              case 'Mercoledi': return 2;
              case 'Giovedi': return 3;
              case 'Venerdi': return 4;
              default: return -1;
          }
        },

        fetchSlots(){
            let self = this;

            $.get('availableSlots', {objType: self.mode, teacher: self.teacher,
                course: self.course}, function (data) {

                let jsonResponse = JSON.parse(JSON.stringify(data));
                self.resultJsonFetch = jsonResponse.result;
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success"){
                    let days = ["Lunedi", "Martedi", "Mercoledi",
                        "Giovedi", "Venerdi"];

                    days.forEach(day =>
                        self.items.push({day: day,
                            slots: jsonResponse.slots[day]})
                    );
                }

            });
        },
        bookSlot(day, slot, index){
            let self = this;

            self.isWaitingNotify = true;
            $.post('insert', {objType: 'ripetizione', teacher: slot.id_number,
                t_slot: slot.time_slot, day: day, user: self.profile.account,
                course: slot.course},
                function (data) {

                self.isWaitingNotify = false;
                let jsonResponse = JSON.parse(JSON.stringify(data));
                console.log(jsonResponse);

                if (jsonResponse.result === "no_user"){
                    self.setLogout();
                    self.notifySessionExpired();
                }
                else if (jsonResponse.result === "success") {
                    console.log(self.items[self.numDay(day)].
                        slots[index]);
                    self.items[self.numDay(day)].
                        slots.splice(index, 1);
                }

                //Prevent all previous notifications
                self.book_info.isActionBook = false;

                self.book_info.isActionBook = true;
                self.book_info.resultJsonBook = jsonResponse.result;
                setTimeout(() => {
                        self.book_info.isActionBook = false;
                        self.book_info.resultJsonBook = "";
                    },
                    2500
                );

            });
        }
    },

    props: {
        //Mode between only-view or for booking
        mode: {
            type: String,
            required: true,

            validateMode(value) {
                // The value must match one of the 2 modes
                return ['slots', 'lessonSlots'].includes(value);
            }
        },

        //Params to be passed only if for booking mode
        teacher: {
            type: String,
            required: false,
            default: ''
        },
        course: {
            type: String,
            required: false,
            default: ''
        }
    }

}