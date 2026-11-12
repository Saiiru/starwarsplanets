// Editorial facts are sourced from Lucasfilm's public Databank.
// Territorial control and political alignment are time-indexed; absence means UNKNOWN.
// Fleet quantities are a deliberately invented operational scenario, never lore claims.
export const ERAS = Object.freeze([
  { id:'CLONE_WARS', label:'Guerras Clônicas', dating:'22–19 BBY', subtitle:'República / Separatistas' },
  { id:'GALACTIC_CIVIL_WAR', label:'Guerra Civil Galáctica', dating:'2 BBY–4 ABY', subtitle:'Império / Aliança Rebelde' }
])
export const FACTIONS = Object.freeze({
  REPUBLIC:{label:'República Galáctica',tone:'republic'},
  CIS:{label:'Confederação Separatista',tone:'cis'},
  EMPIRE:{label:'Império Galáctico',tone:'empire'},
  ALLIANCE:{label:'Aliança Rebelde',tone:'alliance'},
  HUTT:{label:'Domínio Hutt',tone:'hutt'},
  MANDALORE:{label:'Mandalore / governo local',tone:'neutral'},
  NEUTRAL:{label:'Neutro / autônomo',tone:'neutral'},
  UNKNOWN:{label:'Indeterminado',tone:'unknown'}
})
const planet=(id,name,region,records)=>({id,name,region,records})
const record=(era,control,alignment,status,summary,source,confidence='confirmed')=>({era,control,alignment,status,summary,source,confidence,canon:'Canon'})
export const PLANETS=Object.freeze([
 planet('coruscant','Coruscant','Núcleo',[
  record('CLONE_WARS','REPUBLIC','REPUBLIC','capital','Capital da República e sede do Senado.','https://www.starwars.com/databank/coruscant'),
  record('GALACTIC_CIVIL_WAR','EMPIRE','EMPIRE','capital','Capital imperial após a transformação da República.','https://www.starwars.com/databank/coruscant')
 ]),
 planet('kamino','Kamino','Além da Orla Exterior',[
  record('CLONE_WARS','REPUBLIC','REPUBLIC','produção','Instalações de clonagem essenciais ao esforço militar republicano.','https://www.starwars.com/databank/kamino'),
  record('GALACTIC_CIVIL_WAR','UNKNOWN','UNKNOWN','instalações destruídas','A tecnologia de clonagem foi apreendida no início imperial; não inferimos controle político contínuo nesta era.','https://www.starwars.com/databank/kamino','uncertain')
 ]),
 planet('geonosis','Geonosis','Orla Exterior',[
  record('CLONE_WARS','CIS','CIS','indústria contestada','Fábricas de droides e batalhas com a República.','https://www.starwars.com/databank/geonosis'),
  record('GALACTIC_CIVIL_WAR','EMPIRE','UNKNOWN','restrito','O Império restringiu o sistema e utilizou Geonosis no projeto da Estrela da Morte.','https://www.starwars.com/databank/geonosis')
 ]),
 planet('mandalore','Mandalore','Orla Exterior',[
  record('CLONE_WARS','MANDALORE','NEUTRAL','contestação interna','Satine declarou neutralidade; Death Watch e Maul desafiaram o governo.','https://www.starwars.com/databank/mandalore'),
  record('GALACTIC_CIVIL_WAR','EMPIRE','MANDALORE','ocupação / resistência','O Império ocupou Mandalore; clãs resistiram à dominação imperial.','https://www.starwars.com/databank/mandalore')
 ]),
 planet('lothal','Lothal','Orla Exterior',[
  record('GALACTIC_CIVIL_WAR','EMPIRE','ALLIANCE','ocupação contestada','Ocupação imperial, fábricas TIE e atividade rebelde; houve libertação posteriormente.','https://www.starwars.com/databank/lothal')
 ]),
 planet('mon-cala','Mon Cala','Orla Exterior',[
  record('CLONE_WARS','REPUBLIC','REPUBLIC','guerra civil / intervenção CIS','Mon Calamari apoiaram a República enquanto separatistas apoiaram a insurreição Quarren.','https://www.starwars.com/databank/mon-cala'),
  record('GALACTIC_CIVIL_WAR','EMPIRE','ALLIANCE','ocupação / apoio rebelde','O Império subjugou o planeta; Mon Calamari forneceram cruzadores à Aliança.','https://www.starwars.com/databank/mon-cala')
 ]),
 planet('alderaan','Alderaan','Núcleo',[
  record('CLONE_WARS','REPUBLIC','REPUBLIC','sistema membro','Mundo fundador da República representado por Bail Organa.','https://www.starwars.com/databank/alderaan'),
  record('GALACTIC_CIVIL_WAR','EMPIRE','ALLIANCE','destruído durante a era','Formalmente sob o Império, apoiou secretamente a Aliança e foi destruído pela Estrela da Morte. O status varia dentro desta era.','https://www.starwars.com/databank/alderaan')
 ]),
 planet('tatooine','Tatooine','Orla Exterior',[
  record('CLONE_WARS','HUTT','HUTT','influência criminosa','Domínio e influência dos Hutts, não administração republicana presumida.','https://www.starwars.com/databank/tatooine'),
  record('GALACTIC_CIVIL_WAR','HUTT','HUTT','influência criminosa','A influência de Jabba e dos Hutts não deve ser confundida com soberania imperial.','https://www.starwars.com/databank/tatooine')
 ]),
 planet('scarif','Scarif','Orla Exterior',[
  record('GALACTIC_CIVIL_WAR','EMPIRE','EMPIRE','instalação militar','Instalação militar e arquivo estratégico imperial protegido por escudos.','https://www.starwars.com/databank/scarif')
 ]),
 planet('corellia','Corellia','Núcleo',[
  record('GALACTIC_CIVIL_WAR','EMPIRE','UNKNOWN','estaleiros industriais','Estaleiros utilizados pelo Império na construção de TIE fighters e destróieres.','https://www.starwars.com/databank/corellia')
 ]),
 planet('yavin-4','Yavin 4','Orla Exterior',[
  record('GALACTIC_CIVIL_WAR','ALLIANCE','ALLIANCE','base rebelde temporária','Base rebelde em período específico da Guerra Civil; não equivale a domínio permanente de toda a era.','https://www.starwars.com/databank/rebel-alliance')
 ]),
 planet('hoth','Hoth','Orla Exterior',[
  record('GALACTIC_CIVIL_WAR','ALLIANCE','ALLIANCE','base temporária / ataque imperial','Base Echo da Aliança e batalha contra o Império; o controle mudou dentro da era.','https://www.starwars.com/databank/rebel-alliance')
 ])
])
const ship=(id,name,faction,era,kind,source)=>({id,name,faction,era,kind,source})
export const SHIPS=Object.freeze([
 ship('x-wing','T-65 X-wing','ALLIANCE','GALACTIC_CIVIL_WAR','Caça','https://www.starwars.com/databank/x-wing-starfighter'),
 ship('y-wing','Y-wing','ALLIANCE','GALACTIC_CIVIL_WAR','Bombardeiro','https://www.starwars.com/databank/y-wing-starfighter'),
 ship('b-wing','B-wing','ALLIANCE','GALACTIC_CIVIL_WAR','Caça pesado','https://www.starwars.com/databank/b-wing-fighter'),
 ship('a-wing','A-wing','ALLIANCE','GALACTIC_CIVIL_WAR','Interceptador','https://www.starwars.com/databank/a-wing-fighter'),
 ship('mc80','Cruzador Mon Calamari','ALLIANCE','GALACTIC_CIVIL_WAR','Nave capital','https://www.starwars.com/databank/mon-calamari-star-cruiser'),
 ship('nebulon-b','Fragata Nebulon-B','ALLIANCE','GALACTIC_CIVIL_WAR','Fragata','https://www.starwars.com/databank/rebel-alliance'),
 ship('tie-ln','TIE/ln Fighter','EMPIRE','GALACTIC_CIVIL_WAR','Caça','https://www.starwars.com/databank/tie-fighter'),
 ship('tie-in','TIE Interceptor','EMPIRE','GALACTIC_CIVIL_WAR','Interceptador','https://www.starwars.com/databank/tie-interceptor'),
 ship('isd','Imperial Star Destroyer','EMPIRE','GALACTIC_CIVIL_WAR','Nave capital','https://www.starwars.com/databank/imperial-star-destroyer'),
 ship('venator','Venator-class Star Destroyer','REPUBLIC','CLONE_WARS','Nave capital','https://www.starwars.com/databank/venator-class-star-destroyer'),
 ship('arc-170','ARC-170','REPUBLIC','CLONE_WARS','Caça','https://www.starwars.com/databank/arc-170-starfighter'),
 ship('laat','LAAT/i Gunship','REPUBLIC','CLONE_WARS','Transporte','https://www.starwars.com/databank/republic-attack-gunship'),
 ship('y-wing-r','Y-wing (República)','REPUBLIC','CLONE_WARS','Bombardeiro','https://www.starwars.com/databank/y-wing-starfighter'),
 ship('vulture','Vulture Droid','CIS','CLONE_WARS','Drone de combate','https://www.starwars.com/databank/vulture-droid')
])
export const DEMO_INVENTORY=Object.freeze([
 {id:'inv-1',era:'GALACTIC_CIVIL_WAR',faction:'EMPIRE',planet:'lothal',ship:'tie-ln',quantity:48,ready:37},
 {id:'inv-2',era:'GALACTIC_CIVIL_WAR',faction:'EMPIRE',planet:'corellia',ship:'tie-in',quantity:24,ready:19},
 {id:'inv-3',era:'GALACTIC_CIVIL_WAR',faction:'EMPIRE',planet:'scarif',ship:'isd',quantity:2,ready:1},
 {id:'inv-4',era:'GALACTIC_CIVIL_WAR',faction:'ALLIANCE',planet:'yavin-4',ship:'x-wing',quantity:36,ready:28},
 {id:'inv-5',era:'GALACTIC_CIVIL_WAR',faction:'ALLIANCE',planet:'hoth',ship:'y-wing',quantity:12,ready:8},
 {id:'inv-6',era:'GALACTIC_CIVIL_WAR',faction:'ALLIANCE',planet:'mon-cala',ship:'mc80',quantity:3,ready:2},
 {id:'inv-7',era:'CLONE_WARS',faction:'REPUBLIC',planet:'coruscant',ship:'venator',quantity:8,ready:7},
 {id:'inv-8',era:'CLONE_WARS',faction:'REPUBLIC',planet:'kamino',ship:'arc-170',quantity:40,ready:32},
 {id:'inv-9',era:'CLONE_WARS',faction:'CIS',planet:'geonosis',ship:'vulture',quantity:250,ready:204}
])
export const UNKNOWN_RECORD=Object.freeze({control:'UNKNOWN',alignment:'UNKNOWN',status:'não documentado',summary:'Nenhuma fonte suficiente cadastrada para essa era; não presumir filiação.',confidence:'unknown'})
export const planetRecord=(planet,era)=>planet.records.find(r=>r.era===era) || UNKNOWN_RECORD
export const planetById=id=>PLANETS.find(p=>p.id===id)
export const shipById=id=>SHIPS.find(s=>s.id===id)
