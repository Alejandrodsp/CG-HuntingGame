import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';

let materialArray = [];
let texture_ft = new THREE.TextureLoader().load('img/yonder_ft.jpg');
let texture_bk = new THREE.TextureLoader().load('img/yonder_bk.jpg');
let texture_up = new THREE.TextureLoader().load('img/yonder_up.jpg');
let texture_dn = new THREE.TextureLoader().load('img/yonder_dn.jpg');
let texture_rt = new THREE.TextureLoader().load('img/yonder_rt.jpg');
let texture_lf = new THREE.TextureLoader().load('img/yonder_lf.jpg');
let deer = [];
let tree = [];
let bush = [];
let clock = new THREE.Clock();;
let mixer = [];
let keydown = [];
var jumped = false;
let gravity = 0.005;
let velocity = 0.08;
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer();
let eventPageX = 0;
let windowWidth = window.innerWidth;
let zoom = false;
let crouch = false;
let frist = true;
let silence = false;
let anlgoShot = [];
let velocityShot = 0.8;
let shot = [];
let point = 1;
let anlgo;
let hit = 1;
let dead = [];
let direction = [];
let armaSelected = 1;
let ammunition = [81, 81];
let clip = [7, 7];
let control = true;
let reloadControl = false;
let collision = false;
let sinal = -1;
let sinal2 = -1;
let walksound;
let jumpsound;
let shotsound;
let reloadsound;
let noammunationsound;
let deersound;
let reload = window.document.getElementById('reloadId');

initConfig();

createSkybox();

createFloor();

createWorld();

loadSounds();

animate();

function animate() {
  //Aqui testo qual arma está equipada, no caso do binoculo não é preciso mostrar a munição.
  if (armaSelected !== 3) {
    reload.innerHTML = clip[armaSelected - 1] + ' / ' + ammunition[armaSelected - 1];
  }
  else {
    reload.innerHTML = ' ';
  }
  //angulo de rotação do mouse em relação a página.
  anlgo = ((eventPageX - windowWidth / 2) * Math.PI / 30);

  requestAnimationFrame(animate);

  //Aqui entra a lógica do disparo da arma, basicamente cada tiro é um objeto que é movido da câmera até um determinado comprimento
  //E a cada incremento deste deslocamento, é testado se o disparo atingiu algum dos animais da cena.
  if (shot.length) {
    for (var i = 0; i < shot.length; i++) {
      if (shot[i].position.z >= 200 || shot[i].position.x >= 200 || shot[i].position.z <= -200 || shot[i].position.x <= -200) {
        shot = shot.splice(i);
        anlgoShot = anlgoShot.splice(i);
      }
      else {
        shot[i].position.z -= velocityShot * Math.cos(anlgoShot[i]);
        shot[i].position.x -= velocityShot * Math.sin(anlgoShot[i]);
        for (var j = 0; j < deer.length; j++) {
          if (shot[i].position.x <= parseFloat(deer[j].position.x) + parseFloat(1) && shot[i].position.x >= parseFloat(deer[j].position.x) - parseFloat(1) &&
            shot[i].position.y <= parseFloat(deer[j].position.y) + parseFloat(1) && shot[i].position.y >= parseFloat(deer[j].position.y) - parseFloat(1) &&
            shot[i].position.z <= parseFloat(deer[j].position.z) + parseFloat(1) && shot[i].position.z >= parseFloat(deer[j].position.z) - parseFloat(1)) {

            if (point == 1) {
              if (hit) {
                if (direction[j] === 0 || direction[j] === 2) {
                  if ((camera.position.z - deer[j].position.z) > 0) {
                    deer[j].rotation.x = -1.5;
                  }
                  else {
                    deer[j].rotation.x = 1.5;
                  }
                }
                else if (direction[j] === 1 || direction[j] === 3) {
                  if ((camera.position.x - deer[j].position.x) > 0) {
                    deer[j].rotation.y = 3;
                    deer[j].rotation.x = -1.5;

                  }
                  else {
                    deer[j].rotation.y = 0;
                    deer[j].rotation.x = 1.5;
                  }
                }
                dead[j] = true;
                hit = 0;
                createAnimal(deer.length);
                setTimeout(function () { hit = 1; }, 500);
              }
              point = 0;
            }
            setTimeout(function () { point = 1; }, 1000);
          }
        }
      }
    }
  }

  //Aqui está a lógica da movimentação e animação dos animais da cena, ele se move em determinada direção e muda ela após atingir um limite.
  //Caso o personagem se aproxime do animal, este começará a se mover mais rápidamente, para assim simular sua fuga.
  //Caso o personagem se aproxime do animal sem fazer barulho, é possível chegar mais perto do animal sem que ele comece a se mover mais rapidamente.
  var delta = clock.getDelta();

  for (var i = 0; i < mixer.length; i++) {
    if (mixer[i] && !dead[i]) {
      mixer[i].update(delta);
      if (direction[i] === 0) {
        deer[i].rotation.y = 0;
        if ((Math.abs(camera.position.x - deer[i].position.x) < 10) || (Math.abs(camera.position.z - deer[i].position.z) < 10)) {
          if (!silence && !crouch) {
            deer[i].position.x -= 0.05;
          }
          else if ((Math.abs(camera.position.x - deer[i].position.x) < 5) || (Math.abs(camera.position.z - deer[i].position.z) < 5)) {
            deer[i].position.x -= 0.05;
          }
          else {
            deer[i].position.x -= 0.008;
          }
          deersound.play();
        }
        else {
          deer[i].position.x -= 0.008;
        }
        if (deer[i].position.x <= -90 && direction[i] === 0) {
          deer[i].rotation.y = -1.5;
          direction[i] = 1;
        }
      }
      else if (direction[i] === 1) {
        deer[i].rotation.y = -1.5;
        if ((Math.abs(camera.position.x - deer[i].position.x) < 10) || (Math.abs(camera.position.z - deer[i].position.z) < 10)) {
          if (!silence && !crouch) {
            deer[i].position.z -= 0.05;
          }
          else if ((Math.abs(camera.position.x - deer[i].position.x) < 5) || (Math.abs(camera.position.z - deer[i].position.z) < 5)) {
            deer[i].position.z -= 0.05;
          }
          else {
            deer[i].position.z -= 0.008;
          }
          deersound.play();
        }
        else {
          deer[i].position.z -= 0.008;
        }
        if (deer[i].position.z <= -90 && direction[i] === 1) {
          deer[i].rotation.y = 3;
          direction[i] = 2;
        }
      }
      else if (direction[i] === 2) {
        deer[i].rotation.y = 3;
        if ((Math.abs(camera.position.x - deer[i].position.x) < 10) || (Math.abs(camera.position.z - deer[i].position.z) < 10)) {
          if (!silence && !crouch) {
            deer[i].position.x += 0.05;
          }
          else if ((Math.abs(camera.position.x - deer[i].position.x) < 5) || (Math.abs(camera.position.z - deer[i].position.z) < 5)) {
            deer[i].position.x += 0.05;
          }
          else {
            deer[i].position.x += 0.008;
          }
          deersound.play();
        }
        else {
          deer[i].position.x += 0.008;
        }
        if (deer[i].position.x >= 90 && direction[i] === 2) {
          deer[i].rotation.y = 1.5;
          direction[i] = 3;
        }
      }
      else {
        deer[i].rotation.y = 1.5;
        if ((Math.abs(camera.position.x - deer[i].position.x) < 10) || (Math.abs(camera.position.z - deer[i].position.z) < 10)) {
          if (!silence && !crouch) {
            deer[i].position.z += 0.05;
          }
          else if ((Math.abs(camera.position.x - deer[i].position.x) < 5) || (Math.abs(camera.position.z - deer[i].position.z) < 5)) {
            deer[i].position.z += 0.05;
          }
          else {
            deer[i].position.z += 0.008;
          }
          deersound.play();
        }
        else {
          deer[i].position.z += 0.008;
        }
        if (deer[i].position.z >= 90 && direction[i] === 3) {
          deer[i].rotation.y = 0;
          direction[i] = 0;
        }
      }
    }
  }

  //Abaixo estão as lógicas da movimentação do personagem, aqui a cada movimento realizado é testado a colisão com os diferentes objetos da cena.
  if (keydown["ArrowUp"] || keydown["w"]) {
    if (!collisionDetection()) {
      if (camera.position.z - velocity * Math.cos(anlgo) >= -99 && camera.position.z - velocity * Math.cos(anlgo) <= 99) {
        camera.position.z -= velocity * Math.cos(anlgo);
      }
      if (camera.position.x - velocity * Math.sin(anlgo) >= -99 && camera.position.x - velocity * Math.sin(anlgo) <= 99) {
        camera.position.x -= velocity * Math.sin(anlgo);
      }
      collision = false;
    }
    else {
      collision = true;
    }
    if (!crouch && !silence)
      walksound.play();
  }

  if (keydown["ArrowDown"] || keydown["s"]) {
    if (!collisionDetection() || collision) {
      if (camera.position.z + velocity * Math.cos(anlgo) >= -99 && camera.position.z + velocity * Math.cos(anlgo) <= 99) {
        camera.position.z += velocity * Math.cos(anlgo);
      }
      if (camera.position.x + velocity * Math.sin(anlgo) >= -99 && camera.position.x + velocity * Math.sin(anlgo) <= 99) {
        camera.position.x += velocity * Math.sin(anlgo);
      }
      collision = false;
    } else {
      collision = true;
    }
    if (!crouch && !silence)
      walksound.play();
  }

  if (keydown["ArrowRight"] || keydown["d"]) {
    if (!collisionDetection() || collision) {
      if (camera.position.z - velocity * Math.cos(anlgo - 90 * Math.PI / 180) >= -99 && camera.position.z - velocity * Math.cos(anlgo - 90 * Math.PI / 180) <= 99) {
        camera.position.z -= velocity * Math.cos(anlgo - 90 * Math.PI / 180);
      }
      if (camera.position.x - velocity * Math.sin(anlgo - 90 * Math.PI / 180) >= -99 && camera.position.x - velocity * Math.sin(anlgo - 90 * Math.PI / 180) <= 99) {
        camera.position.x -= velocity * Math.sin(anlgo - 90 * Math.PI / 180);
      }
    } else {
      collision = true;
    }
    if (!crouch && !silence)
      walksound.play();
  }

  if (keydown["ArrowLeft"] || keydown["a"]) {
    if (!collisionDetection() || collision) {
      if (camera.position.z + velocity * Math.cos(anlgo - 90 * Math.PI / 180) >= -99 && camera.position.z + velocity * Math.cos(anlgo - 90 * Math.PI / 180) <= 99) {
        camera.position.z += velocity * Math.cos(anlgo - 90 * Math.PI / 180);
      }
      if (camera.position.x + velocity * Math.sin(anlgo - 90 * Math.PI / 180) >= -99 && camera.position.x + velocity * Math.sin(anlgo - 90 * Math.PI / 180) <= 99) {
        camera.position.x += velocity * Math.sin(anlgo - 90 * Math.PI / 180);
      }
    }
    else {
      collision = true;
    }
    if (!crouch && !silence)
      walksound.play();
  }

  //Aqui é a lógica para o personagem se agachar.
  if (keydown['c']) {
    velocity = 0.02;
    crouch = true;
    camera.position.y = -0.2;
  }
  else {
    if (!silence) {
      velocity = 0.08;
    }
    crouch = false;
    if (jumped === false) {
      camera.position.y = 0;
    }
  }

  //Aqui é a lógica para o personagem se mover sem fazer barulho.
  if (keydown['v']) {
    silence = true;
    velocity = 0.04;
  }
  else {
    silence = false;
    if (!crouch) {
      velocity = 0.08;
    }
  }

  //Aqui está a lógica do salto do personagem, quando salta a câmera que representa o personagem é deslocada para cima
  //E após isso esse deslocamento é decrementado com base na gravidade até que o personagem volte para o chão novamente.
  if (keydown[" "]) {
    if (jumped == false) {
      jumpsound.play();
      jumped = 0.1;
    }
  }
  if (jumped) {
    camera.position.y += jumped;
    if (camera.position.y >= 0)
      jumped -= gravity;
    else
      jumped = false;
  }

  //Ao clicar o botão 1 a arma principal é equipada.
  if (keydown['1']) {
    armaSelected = 1;
    document.getElementById("armaImg").src = "img/arma.png";
  }

  //Ao clicar o botão 2 a arma secundária é equipada.
  if (keydown['2']) {
    armaSelected = 2;
    document.getElementById("armaImg").src = "img/armaSecundaria.png";
  }

  //Ao clicar o botão 3 o binoculo é equipado.
  if (keydown['3']) {
    armaSelected = 3;
    document.getElementById("armaImg").src = "img/binoculo.png";
  }

  //O botão r é usado para recarregar a arma, aqui é testado se o personagem possui munição para realizar o carregamento da arma.
  if (keydown['r']) {
    if (ammunition[armaSelected - 1] !== 0 && clip[armaSelected - 1] !== 7) {
      if (armaSelected === 1) {
        document.getElementById("armaImg").src = "img/armaRecarregando.png";
        reloadsound.play();
        setTimeout(function () {
          document.getElementById("armaImg").src = "img/arma.png";
        }, 500);
      }
      else if (armaSelected === 2) {
        document.getElementById("armaImg").src = "img/armaSecundariaRecarregando.png";
        reloadsound.play();
        setTimeout(function () {
          document.getElementById("armaImg").src = "img/armaSecundaria.png";
        }, 500);
      }
      ammunition[armaSelected - 1] = ammunition[armaSelected - 1] - (7 - clip[armaSelected - 1]);
      clip[armaSelected - 1] = 7;
    }
  }

  //Aqui é capturado o movimento do mouse e aplicado a rotação da camera;
  if (eventPageX != 'undefined') {
    camera.rotation.y = ((eventPageX - windowWidth / 2) * Math.PI / 30);
  }

  //Nessa parte capturo os cliques dos botões do mouse.
  //Case 0 é equivalente ao botão esquerdo do mouse, usado para realizar os disparos das armas.
  //Case 2 é equivalente ao botão direito do mouse, usado para o zoom das armas.
  document.addEventListener('mouseup', logMouseButton);
  function logMouseButton(e) {
    if (typeof e === 'object') {
      //Ao realizar o primeiro clique no mouse, é requisitada a função que deixa a janela em tela cheia.
      if (frist) {
        requestFullScreen();
        frist = false;
      }
      switch (e.button) {
        case 0:
          if (armaSelected !== 3) {
            //Aqui são criados os objetos que irão representar os tiros das armas.
            if (shot.length < 200) {
              var arrayChave = shot.length;
              var geometry = new THREE.BoxGeometry(0.0002, 0.0002, 0.001);
              var material = new THREE.MeshBasicMaterial({ color: 0xffef7b });
              shot[arrayChave] = new THREE.Mesh(geometry, material);
              shot[arrayChave].rotation.y = camera.rotation.y;
              shot[arrayChave].position.y = camera.position.y;
              shot[arrayChave].position.z = camera.position.z;
              shot[arrayChave].position.x = camera.position.x;
              anlgoShot[arrayChave] = anlgo;
              scene.add(shot[arrayChave]);
            }
            //A cada tiro é preciso atualizar a quantidade de munição, isso é feito no trecho abaixo.
            if (control) {
              if (clip[armaSelected - 1] > 0) {
                clip[armaSelected - 1] = clip[armaSelected - 1] - 1;
              }
              control = false;
              if (clip[armaSelected - 1] === 0) {
                reloadControl = true;
                if (ammunition[armaSelected - 1] > 7) {
                  ammunition[armaSelected - 1] = ammunition[armaSelected - 1] - 7;
                  clip[armaSelected - 1] = 7;
                }
                else if (ammunition[armaSelected - 1] !== 0) {
                  clip[armaSelected - 1] = ammunition[armaSelected - 1];
                  ammunition[armaSelected - 1] = 0;
                }
              }
            }

            //Caso o personagem não possua mais munições
            if (clip[armaSelected - 1] === 0 && ammunition[armaSelected - 1] === 0) {
              noammunationsound.play();
            }
            //Caso contrário um disparo é feito.
            else {
              if (zoom === false) {
                if (armaSelected === 1) {
                  if (!reloadControl) {
                    document.getElementById("armaImg").src = "img/armaDisparando.png";
                    shotsound.play();
                    setTimeout(function () {
                      document.getElementById("armaImg").src = "img/arma.png";
                    }, 500);
                  }
                  else {
                    reloadControl = false;
                    setTimeout(function () {
                      reloadsound.play();
                      document.getElementById("armaImg").src = "img/armaRecarregando.png";
                    }, 1000);
                    setTimeout(function () {
                      document.getElementById("armaImg").src = "img/arma.png";
                    }, 1500);
                  }
                }
                else {
                  if (!reloadControl) {
                    document.getElementById("armaImg").src = "img/armaSecundariaDisparando.png";
                    shotsound.play();
                    setTimeout(function () {
                      document.getElementById("armaImg").src = "img/armaSecundaria.png";
                    }, 500);
                  }
                  else {
                    reloadControl = false;
                    setTimeout(function () {
                      reloadsound.play();
                      document.getElementById("armaImg").src = "img/armaSecundariaRecarregando.png";
                    }, 1000);
                    setTimeout(function () {
                      document.getElementById("armaImg").src = "img/armaSecundaria.png";
                    }, 1500);
                  }
                }
              }
              else {
                if (clip[armaSelected - 1] !== 0) {
                  shotsound.play();
                }
                else {
                  reloadsound.play();
                }
              }
            }
          }
          break;
        case 2:
          //Aqui é feito o zoom das armas, aumentando o .zoom da camera.
          if (zoom === false) {
            if (armaSelected === 1) {
              document.getElementById("miraImg").src = "img/scopeopen.png";
              document.getElementById("armaImg").src = "img/semarma.png";
              zoom = true;
              camera.zoom = 4;
              camera.updateProjectionMatrix();
            }
            else if (armaSelected === 3) {
              document.getElementById("miraImg").src = "img/binoculoopen.png";
              document.getElementById("armaImg").src = "img/semarma.png";
              zoom = true;
              camera.zoom = 6;
              camera.updateProjectionMatrix();
            }
          }
          else {
            if (armaSelected === 1) {
              document.getElementById("miraImg").src = "img/scopeclosed.png";
              document.getElementById("armaImg").src = "img/arma.png";
            }
            else {
              document.getElementById("miraImg").src = "img/scopeclosed.png";
              document.getElementById("armaImg").src = "img/binoculo.png";
            }
            zoom = false;
            camera.zoom = 1;
            camera.updateProjectionMatrix();
          }
          break;
        default:
          console.log('Unknown button code');
      }
    }
  }
  //Aqui estão o render.
  renderer.render(scene, camera);
  control = true;
}

//Função que deixa a janela em tela cheia.
function requestFullScreen() {
  var el = document.body;

  var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen
    || el.mozRequestFullScreen || el.msRequestFullScreen;

  if (requestMethod) {

    requestMethod.call(el);

  } else if (typeof window.ActiveXObject !== "undefined") {

    var wscript = new ActiveXObject("WScript.Shell");

    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}

//Função que realiza as configurações iniciais como
//Calculo da posição do mouse, captura do aperto das teclas
//Inicialização da câmera, renderizador e iluminação do ambiente.
function initConfig() {
  document.documentElement.style.cursor = 'none';
  reload.innerHTML = clip[armaSelected - 1] + ' / ' + ammunition[armaSelected - 1];

  (function () {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
      var eventDoc, doc, body;

      event = event || window.event;

      if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
      }
      eventPageX -= event.movementX * 0.05;
    }
  })();

  window.onkeydown = function (e) {
    keydown[e.key] = true;
  }

  window.onkeyup = function (e) {
    keydown[e.key] = false;
  }
  camera.position.set(Math.floor(80 * Math.random()), 0, Math.floor(80 * Math.random()));
  renderer.setSize(window.innerWidth + 110, window.innerHeight + 110);
  var canvas = document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();
  var ambientLight = new THREE.AmbientLight('#ffffff');
  scene.add(ambientLight);
}

//Função que cria a skybox
function createSkybox() {
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));
  for (let i = 0; i < 6; i++)
    materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry(200, 200, 200);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

//Função que cria o solo do mundo
function createFloor() {
  let floorTexture = new THREE.ImageUtils.loadTexture('img/pisoTextura.jpg');
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(20, 20);
  let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
  let floorGeometry = new THREE.PlaneGeometry(210, 210, 210, 210);
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.x = 2;
  floor.position.y = -0.8;
  floor.position.z = 3;
  floor.rotation.x = -90 * Math.PI / 180
  scene.add(floor);
}

//Função que cria os demais objetos do mundo
//Primeiro são criados os animais, cada um deles em posições aleatórias e com no minímo 20 unidades de distância do personagem
//Após isso são criadas as diversas árvores do mundo, em posições aleatórias afim de gerar uma floresta
//Essas árvores são clonadas para assim mantermos uma única mesha dela na memória
//Por fim são adicionados arbustos ao mundo, da mesma forma com que as árvores são adicionadas
function createWorld() {
  THREE.Cache.enabled = true;

  for (let c = 0; c < 3; c++) {
    var loader = new GLTFLoader();
    loader.load('obj/deer/scene.gltf', function (gltf) {
      deer[c] = gltf.scene;
      deer[c].position.y = -0.7;
      do {
        var positionx = sinal * Math.floor(80 * Math.random());
      } while (Math.abs(camera.position.x - positionx) < 20);
      deer[c].position.x = positionx;
      do {
        var positionz = sinal * Math.floor(80 * Math.random());
      } while (Math.abs(camera.position.z - positionz) < 20);
      deer[c].position.z = positionz;
      scene.add(deer[c]);
      dead[c] = false;
      direction[c] = Math.floor(3 * Math.random());
      mixer[c] = new THREE.AnimationMixer(deer[c]);

      gltf.animations.forEach((clip) => {

        mixer[c].clipAction(clip).play();

      });
      c++;
      sinal *= -1;
    });
  }

  var loader = new GLTFLoader();
  loader.load('obj/tree/scene.gltf', function (gltf) {
    for (var i = 0; i < 1000; i++) {
      tree[i] = gltf.scene.clone();
      tree[i].scale.set(0.02, 0.02, 0.02);
      tree[i].position.y = -0.4;
      tree[i].position.z = sinal * Math.floor(98 * Math.random());
      tree[i].position.x = sinal2 * Math.floor(98 * Math.random());
      scene.add(tree[i]);
      sinal *= -1;
      if (i % 2 === 0) {
        sinal2 *= -1;
      }
    }
  });

  var loader = new GLTFLoader();
  loader.load('obj/bush/scene.gltf', function (gltf) {
    for (var i = 0; i < 500; i++) {
      bush[i] = gltf.scene.clone();
      bush[i].scale.set(0.005, 0.005, 0.005);
      bush[i].position.y = -0.8;
      bush[i].position.z = sinal * Math.floor(100 * Math.random());
      bush[i].position.x = sinal2 * Math.floor(100 * Math.random());
      scene.add(bush[i]);
      sinal *= -1;
      if (i % 2 === 0) {
        sinal2 *= -1;
      }

    }
  });
}

//Essa função é utilizada para criar um novo animal no mundo toda vez que um outro tiver sido morto
function createAnimal(n) {

  var loader = new GLTFLoader();
  loader.load('obj/deer/scene.gltf', function (gltf) {
    deer[n] = gltf.scene;
    deer[n].position.y = -0.7;
    do {
      var positionx = sinal * Math.floor(80 * Math.random());
    } while (Math.abs(camera.position.x - positionx) < 20);
    deer[n].position.x = positionx;
    do {
      var positionz = sinal * Math.floor(80 * Math.random());
    } while (Math.abs(camera.position.z - positionz) < 20);
    deer[n].position.z = positionz;
    scene.add(deer[n]);
    dead[n] = false;
    direction[n] = Math.floor(3 * Math.random());
    mixer[n] = new THREE.AnimationMixer(deer[n]);

    gltf.animations.forEach((clip) => {

      mixer[n].clipAction(clip).play();

    });
    sinal *= -1;
  });
}

//Essa função é usada para carregar todos efeitos sonoros que são utilizados no jogo
function loadSounds() {
  walksound = new Audio('sound/walk.mp3');
  walksound.playbackRate = 2;

  jumpsound = new Audio('sound/jump.mp3');
  jumpsound.playbackRate = 2;

  shotsound = new Audio('sound/shot.mp3');
  shotsound.playbackRate = 2;

  reloadsound = new Audio('sound/reload.mp3');
  reloadsound.playbackRate = 2;

  noammunationsound = new Audio('sound/noammunation.mp3');
  noammunationsound.playbackRate = 2;

  deersound = new Audio('sound/deersound.mp3');
  deersound.playbackRate = 2;
}

//Função auxiliar para calcular a distancia entre dois pontos
//É utilizada para detecção de colisão
function distance(a, b) {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
}

//Função que detecta se o personagem colidiu com algum objeto da cena
function collisionDetection() {

  for (var i = 0; i < deer.length; i++) {
    var positioncam = [];
    positioncam[0] = camera.position.x;
    positioncam[1] = camera.position.y;
    positioncam[2] = camera.position.z;
    var positondeer = [];
    positondeer[0] = deer[i].position.x;
    positondeer[1] = deer[i].position.y;
    positondeer[2] = deer[i].position.z;
    if (distance(positioncam, positondeer) < 1) {
      return true;
    }
  }
  for (var i = 0; i < tree.length; i++) {
    var positioncam = [];
    positioncam[0] = camera.position.x;
    positioncam[1] = camera.position.y;
    positioncam[2] = camera.position.z;
    var positiontree = [];
    positiontree[0] = tree[i].position.x;
    positiontree[1] = tree[i].position.y;
    positiontree[2] = tree[i].position.z;
    if (distance(positioncam, positiontree) < 0.5) {
      return true;
    }
  }
  return false;
}