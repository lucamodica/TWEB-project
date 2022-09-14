
let all_lessons = {
    mixins: [management_utils],

    template:
        `
        <div class="container-fluid py-5">
            <!-- Title row -->  
            <div class="row">
              <div class="col-sm"></div>
              <div class="col-sm text-center pt-4 pb-4">
                <h2>Storico lezioni</h2>
              </div>
              <div class="col-sm">
              </div>
            </div>
            
            <!-- Subtitle row -->
            <div class="row">
              <div class="col-sm"></div>
              <div class="col-sm text-center pb-4">
                <h4>
                    Ecco a te l'elenco di tutte le lezioni 
                    <span class="badge badge-primary">attive</span>,
                    <span class="badge badge-success">effettuate</span> e 
                    <span class="badge badge-danger">disdette</span> 
                    dagli utenti
                </h4>
              </div>
              <div class="col-sm"></div>
            </div>
            
            <!-- Content row -->
            <div class="row">
              
              <div class="col-2"></div>
              
              <!-- Content table -->
              <div class="col-8 text-center pb-5">
                <div v-if="resultJsonFetch == 'success'">
                    <div v-if="noItems">Nessuna lezione presente.</div>
                    <table v-else class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Docente</th>
                                <th scope="col">Ora</th>
                                <th scope="col">Giorno</th>
                                <th scope="col">Stato</th>
                                <th scope="col">Utente</th>
                                <th scope="col">Corso</th>
                            </tr>
                        </thead>
                        <tbody id="courseContent">
                            <tr v-for="(item, index) in items">
                                <td>{{item.name}} {{item.surname}} ({{item.teacher}})</td>
                                <td>{{item.t_slot}}</td>
                                <td>{{item.day}}</td>
                                <td>
                                    <span class="badge" :class="statusBadge(item.status)">
                                        {{item.status}}
                                    </span>
                                </td>
                                <td>{{item.user}}</td>
                                <td>{{item.course}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else>{{warnMsgFetch}}</div>
              </div>
              
              <div class="col-2"></div>
              
            </div>
        </div>
        `,

    created() {
        //Fetch all the lessons archive
        let self = this;
        self.fetchData("ripetizione", self.items);
    },

    methods: {
        statusBadge(status){
            switch (status){
                case "attiva":
                    return "badge-primary";
                case "effettuata":
                    return "badge-success";
                case "disdetta":
                    return "badge-danger";
                default:
                    return "";
            }
        }
    }

}