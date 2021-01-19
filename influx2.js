/**
 * Universidade Estadual Paulista "J�lio de Mesquita Filho"
 * Nome: Felipe Domingues, Ricardo Pasquatti
 * Orientador: Paci�ncia Godoy
 */

/**
 * Defini��o de v�riaveis que receber�o os pacotes qu est�o sendo importado pelo "require"
 */
const request = require('request');
const Influx = require('influx');
/**
 * Defini��o de vari�vel que escuta a rota via protocolo HTTP
 */
const url = 'http://192.168.1.201:3005/api/daq/riin'
/**
 * Essa fun��o, que recebe a estrutura de dados JSON pela rota (por isso true), indica
 * quando n�o estamos obtendo resposta do servi�o DAQ, apresentando uma mensagem de 
 * erro para o desenvolvedor.
 * 
 * Caso esteja tudo "online",  a fun��o nativa do Moleculer influx.writeMesurement () define
 * o tipo de medi��o, por exemplo, "inputs" para os dados oriundos do riin e as tags e campos
 * a serem preenchido. Foi necess�rio escrever para cada um dos sensores.
 * 
 * PIT129 ---> reservoir
 * PIT118 ---> pipe-pressure
 * LIT125 ---> level
 * FIT116 ---> flow
 */
const wdb = () => {
  request({ url: url, json: true}, (error, response) => {
    if(error){
      console.log('Unable to connect to daq service!')
      }
    else{
      influx.writeMeasurement('inputs', [
        {
          tags: { variable: 'reservoir' },
          fields: {   PIT129: Number(response.body.riin[0]), 
          },
        }
      ])
      influx.writeMeasurement('inputs', [
        {
          tags: { variable: 'pipe-pressure' },
          fields: {   PIT118: Number(response.body.riin[1]), 
          },
        }
      ])
      influx.writeMeasurement('inputs', [
        {
          tags: { variable: 'level' },
          fields: {   LIT125: Number(response.body.riin[2]), 
          },
        }
      ])      
      influx.writeMeasurement('inputs', [
        {
          tags: { variable: 'flow' },
          fields: {   FIT116: Number(response.body.riin[3]), 
          },
        }
      ])
/**
 * Ao utilizar o Grafana, foi verificado que algumas unidades de medi��o que gostar�amos de utilizar
 * n�o est�o presentes para apresentar nos gr�ficos. Para tanto, foi criado um segundo tipo de medi��o
 * o qual definimos como inputs_units (!!Lembrando que os nomes das v�ri�veis poder�o ser modificadas
 * em qualque momento, contando que seja modificados tamb�m seus par�metros)
 */
     
    
      
    }
  })
}
/**
 * Essa fun��o permite que todo o processo seja executado e 0,5 segundos
 */
setInterval(wdb(),500);
/**
setInterval(()=> {
  console.log('tick')
  wdb();
},500)
 */
/**
 * Essa nativa do Moleculer define (permite configurar) os tipos de dados que ser�o armazenados, pelo Schema.
 * Lembrando que � necess�rio que seja para os dois tipo de medi��e que temos:
 * 
 * Input       ---> dados apresentados pelos sensores (0-100%)
 * Input_units ---> necess�rio para apresenta��o nos gr�ficos com a unidade de nossa escolha
 */
const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: 'db2',
  schema: [
    {
      measurement: 'inputs',
      fields: {
        PIT129: Influx.FieldType.INTEGER,
        PIT118: Influx.FieldType.INTEGER,
        LIT125: Influx.FieldType.INTEGER,
        FIT116: Influx.FieldType.INTEGER,
      },
/**
      measurement: 'inputs_',
      fields: {
        PIT129_: Influx.FieldType.INTEGER,
        PIT118_: Influx.FieldType.INTEGER,
        LIT125_: Influx.FieldType.INTEGER,
      }, */
      tags: [
              'variable'
            ]
    }
  ]
})
/**
 * Essa fun��o permite a varredura no nosso hardware � procura do banco de dados com esse nome
 * se esse nome database n�o for encontrado, essa fun��o o incluir�.
 */
influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('db2')) {
    return influx.createDatabase('db2');
    }
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
  })