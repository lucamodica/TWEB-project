let home = {
    mixins: [globals],
    template:
        `
        <div id="home">
            <div class="container py-5">
                <!-- Title row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pt-5 pb-5">
                    <h2>Benvenuto {{welcomeName}}!</h2>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Subtitle row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-5">
                    <h4>Dove possiamo portarti?</h4>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Lesson view/create row -->
                <div class="row">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-2">
                    <div class="btn-group">
                        <router-link type="button" class="btn btn-primary m-1 p-3" to="/your_lessons"
                        v-if="profile.role == 'amministratore' || profile.role == 'utente'">
                                Le tue ripetizioni
                        </router-link>
                        <router-link type="button" class="btn btn-success m-1 p-3" :to="slotAddress">
                                {{slotTitle}}
                        </router-link>
                    </div>
                  </div>
                  <div class="col-sm"></div>
                </div>
                
                <!-- Admin management tool row -->
                <div class="row" v-if="profile.role == 'amministratore'">
                  <div class="col-sm"></div>
                  <div class="col-sm text-center pb-3">
                    <div class="form-group m-4">
                        <div class="btn-group">
                          <button type="button" class="btn btn-secondary dropdown-toggle p-3" 
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Gestisci <span class="sr-only">Toggle Dropdown</span>
                          </button>
                          <div class="dropdown-menu dropdown-menu-left">
                            <router-link class="dropdown-item" to="/manage_teachers">
                                Docenti
                            </router-link>
                            <router-link class="dropdown-item" to="/manage_courses">
                                Corsi
                            </router-link>
                            <router-link class="dropdown-item" to="/manage_affiliations">
                                Affiliazioni
                            </router-link>
                          </div>
                        </div>
                    </div>
                  </div>    
                  <div class="col-sm"></div>
                </div>
            </div>
        </div>
        `,

    computed: {
        welcomeName(){
            return (this.profile.role === "ospite") ? "ospite"
                : this.profile.account;
        },
        slotTitle(){
            return (this.profile.role === "ospite") ? "Visualizza slot disponibili"
                : "Crea ripetizione";
        },
        slotAddress(){
            return (this.profile.role === "ospite") ? "/available_slots?mode=slots"
                : "/select_course_for_lesson";
        }
    }

}