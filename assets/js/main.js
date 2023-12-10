const BASE_URL = "http://127.0.0.1:5000";

const resultMessages = {
  'AB': ['ANORMAL', 'O diagnóstico é ANORMAL'],
  'NO': ['NORMAL', 'O diagnóstico é NORMAL']
}
const fields = [
  "name",
  "pelvic-incidence",
  "pelvic-tilt",
  "lumbar-lordosis-angle",
  "sacral-slope",
  "pelvic-radius",
  "grade-of-spondylolisthesis",
]

/**
 * Limpa o formulário
 */
function resetForm() {
  fields.forEach(field => document.getElementById(field).value = '')
}

/**
 * Cria uma linha para a tabela de pacientes
 * @param {Object} Object { name, result, empty }  
 * @returns tag tr preenchida com os dados da linha
 */
function rowTable({name, result, date, empty}) {
  const tr = document.createElement("tr");

  if (empty) {
    const tdEmpty = document.createElement("td");
    tdEmpty.textContent = empty;
    tr.appendChild(tdEmpty);
  } else {
    const tdDate = document.createElement("td");
    const tdName = document.createElement("td");
    const tdResult = document.createElement("td");
    tdResult.classList = '--negative'

    if (result == 'AB') {
      tdResult.classList = '--positive'
    }
    tdDate.textContent = date;
    tdName.textContent = name;
    tdResult.textContent = resultMessages[result][0];

    tr.appendChild(tdDate);
    tr.appendChild(tdName);
    tr.appendChild(tdResult);
  }

  return tr
}

/**
 * Faz a chamada a API para adicionar um novo paciente com os dados do formulário
 * @param {*} event 
 */
async function addPatient(event) {
  event.preventDefault();

  const name = document.getElementById(fields[0]).value;
  const pelvic_incidence = document.getElementById(fields[1]).value;
  const pelvic_tilt = document.getElementById(fields[2]).value;
  const lumbar_lordosis_angle = document.getElementById(fields[3]).value;
  const sacral_slope = document.getElementById(fields[4]).value;
  const pelvic_radius = document.getElementById(fields[5]).value;
  const grade_of_spondylolisthesis = document.getElementById(fields[6]).value;

  if ([
    name,
    pelvic_incidence,
    pelvic_tilt,
    lumbar_lordosis_angle,
    sacral_slope,
    pelvic_radius,
    grade_of_spondylolisthesis
  ].some(item => !item)) {
    return
  }

  const patientFormData = new FormData();

  patientFormData.append('name', name);
  patientFormData.append('pelvic_incidence', pelvic_incidence);
  patientFormData.append('pelvic_tilt', pelvic_tilt);
  patientFormData.append('lumbar_lordosis_angle', lumbar_lordosis_angle);
  patientFormData.append('sacral_slope', sacral_slope);
  patientFormData.append('pelvic_radius', pelvic_radius);
  patientFormData.append('grade_of_spondylolisthesis', grade_of_spondylolisthesis);

  const resultDiv = document.getElementsByClassName('result')[0]
  resultDiv.classList = 'result --analize'
  document.getElementsByClassName('result')[0].innerHTML = 'Analisando informações e gerando o resultado...';

  window.setTimeout(async () => {
    await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      body: patientFormData
    })
      .then((response) => response.json())
      .then((data) => {
        resultDiv.classList = `result ${data.result === 'AB' ? '--positive' : '--negative'}`
        resultDiv.innerHTML = resultMessages[data.result][1];
        getPatients()
        resetForm();
      })
      .catch((error) => {
        console.error('Error:', error);
        resultDiv.classList = 'result'
      });
  }, 1500)
}

/**
 * Retorna os pacientes da API e preeche a tabela com esses pacientes
 * @returns 
 */
async function getPatients() {
    const { patients } = await fetch(`${BASE_URL}/patients`, { method: 'GET' })
      .then(data => data.json())
      .then(response => response)
      .catch((error) => console.error('Error:', error));
    
    const tbody = document.querySelector('.results tbody');
    tbody.innerHTML =  '';

    if (patients.length) {
      patients.forEach(({name, result, created_at}) => {
        tbody.appendChild(rowTable({name, result, date: new Date(created_at).toLocaleString('pt-BR', { timeZone: 'UTC' })}));
      });

      return;
    }

    tbody.appendChild(rowTable({empty: 'Nenhum paciente cadastrado!'}));
}

// Pega o evento de submit do formulário e chama a função addPatient
document.getElementById("form").addEventListener("submit", (event) => {
  addPatient(event);
});

// Chama getPatients toda vez que a pagina é carregada
getPatients()