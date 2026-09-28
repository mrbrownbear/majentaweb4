import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './style.css';

gsap.registerPlugin(ScrollTrigger);
const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const smooth = (a,b,v) => { const x=clamp((v-a)/(b-a),0,1); return x*x*(3-2*x); };
const V = (a) => new THREE.Vector3(...a);
const chapters = [
 ['THE DRAWING','Information.\nMade tangible.','Digital engineering in motion.'],
 ['THE PLAN BECOMES SPACE','Clarity from\nthe start.','Strategy for complex engineering and information challenges.'],
 ['STRUCTURAL ASSEMBLY','Every detail.\nCoordinated.','Model Management — from design through delivery.'],
 ['THE FACADE','A clearer\npicture.','Bring complex engineering information into focus.'],
 ['APPROACH','A closer\nperspective.',''],
 ['THE ENTRANCE','From the outside.\nTo the detail.',''],
 ['THE ATRIUM','Connected\nthinking.',''],
 ['MATERIAL DETAIL','Precision.\nAt every scale.',''],
 ['THE STAIRCASE','Progress,\nmade visible.',''],
 ['THE WORKSPACE','Built around\nbetter information.','CAD Services — accurate engineering data.'],
 ['THE COURTYARD','Room to\nsee further.',''],
 ['THE SKY LEVEL','Trusted through\ndelivery.','Information Management — controlled, reliable and useful.'],
 ['EXPLODED ARCHITECTURE','Understand\nthe whole.','See how every part belongs.'],
 ['DECONSTRUCTION','Everything\ncomes together.',''],
 ['MAJENTA','Engineering information. Made useful.','Strategy · Models · Information · CAD']
];
const landmarks=[0,.075,.15,.235,.30,.36,.425,.49,.555,.62,.685,.75,.815,.875,.96];
// Positions are in the normalized building's own coordinate system, metres approximately.
const frames=[
 {p:[0,32,.01],t:[0,0,0],f:37},
 {p:[16,23,20],t:[0,4,0],f:43},
 {p:[19,13,20],t:[0,5,0],f:44},
 {p:[17,10,19],t:[0,5.5,0],f:44},
 {p:[5,3,15],t:[0,2.2,0],f:49},
 {p:[-2.2,1.8,7.3],t:[-2,2.3,-2],f:58},
 {p:[-2.2,2.2,5.4],t:[-2,3.2,-2.5],f:64},
 {p:[-4.6,2.4,5.6],t:[-3.5,2.6,-1.5],f:60},
 {p:[-2.2,6,5.7],t:[-2,6.8,-2.5],f:64},
 {p:[1.7,6.1,5.7],t:[0,6.3,-3.8],f:62},
 {p:[2,6.4,7],t:[-1,6.2,0],f:55},
 {p:[18,17,19],t:[0,7,0],f:45},
 {p:[22,19,24],t:[0,9,0],f:46},
 {p:[8,15,35],t:[0,8,0],f:43},
 {p:[0,8,48],t:[0,8,0],f:40}
];
const contactURL='https://www.majentasolutions.com/contact-us';
$('accessible-story').innerHTML=chapters.map((c,i)=>`<section><h2>${i+1}. ${c[0]}</h2><p>${c[1].replace('\n',' ')} ${c[2]}</p></section>`).join('');
const navLabels=['DRAW','BUILD','ENTER','EXPLORE','ASCEND','TRANSFORM'];
const navIndices=[0,2,5,7,11,13];
$('chapter-nav').innerHTML=navLabels.map((s,i)=>`<button data-index="${navIndices[i]}"><b>0${i+1}</b>${s}<i></i></button>`).join('');
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis, progress=0, loaded=false, renderer, scene, camera, modelMaterial, ground, planGroup;
let matrixTexture, matrixData;
let pieces=[], planLines=[], lastChapter=-1, readyAt=0;
let key, fill, interiorLight;
const scratch=new THREE.Vector3(),target=new THREE.Vector3();
const white = new THREE.Color('#faf9f6'), warm = new THREE.Color('#ede9e1');
const sourceWhite = new THREE.Color(1,1,1), magenta = new THREE.Color('#d71b83');
function journeyEnd(){return $('journey').offsetHeight-innerHeight;}
function go(index){const target=landmarks[index]*journeyEnd();if(lenis)lenis.scrollTo(target,{immediate:reduced,duration:1.5});else scrollTo({top:target,behavior:reduced?'instant':'smooth'});}
document.querySelectorAll('[data-index]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.index))));
$('retry').onclick=()=>location.reload();
$('home').onclick=e=>{e.preventDefault();go(0)};$('replay').onclick=()=>go(0);
$('motion').onclick=()=>{reduced=!reduced;syncMotion();renderWorld(progress)};
function syncMotion(){ $('motion').setAttribute('aria-pressed',String(reduced));$('motion').textContent=reduced?'Full motion':'Reduce motion';if(lenis){lenis.options.smoothWheel=!reduced;lenis.start();} }
addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','BUTTON','A'].includes(document.activeElement?.tagName))return;if(e.code==='ArrowRight'){e.preventDefault();go(Math.min(lastChapter+1,14));}if(e.code==='ArrowLeft'){e.preventDefault();go(Math.max(lastChapter-1,0));}});
function fail(error){console.error(error);$('loading').hidden=true;$('error').hidden=false;window.__majentaError=String(error);}
try {
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1));renderer.setSize(innerWidth,innerHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 $('stage').appendChild(renderer.domElement);scene=new THREE.Scene();scene.background=white.clone();scene.fog=new THREE.Fog('#faf9f6',65,140);
 camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.06,220);
 const pmrem=new THREE.PMREMGenerator(renderer);const env=new RoomEnvironment();scene.environment=pmrem.fromScene(env,.04).texture;env.dispose();pmrem.dispose();scene.environmentIntensity=.6;
 scene.add(new THREE.HemisphereLight('#fff9ef','#bbbcc5',1.3));
 key=new THREE.DirectionalLight('#fff0d7',3);key.position.set(12,24,14);scene.add(key);
 fill=new THREE.DirectionalLight('#e1e8ff',1.2);fill.position.set(-12,12,-8);scene.add(fill);
 interiorLight=new THREE.PointLight('#ffe1ba',14,20,1.5);interiorLight.position.set(0,5,0);scene.add(interiorLight);
 ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),new THREE.MeshStandardMaterial({color:'#faf9f6',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.05;scene.add(ground);
 // Soft contact shadow, no unrelated geometry or effects.
 const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d');const gr=cx.createRadialGradient(64,64,8,64,64,63);gr.addColorStop(0,'rgba(20,20,30,0.22)');gr.addColorStop(1,'rgba(20,20,30,0)');cx.fillStyle=gr;cx.fillRect(0,0,128,128);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(24,24),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;scene.add(shadow);
 planGroup=new THREE.Group();scene.add(planGroup);
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 loader.load('/assets/building.glb',g=>{try{prepareModel(g.scene);loaded=true;readyAt=performance.now();$('loading').hidden=true;window.__majentaReady=true;renderWorld(progress);}catch(e){fail(e)}},e=>{const pct=e.total?Math.round(e.loaded/e.total*100):50;$('load-percent').textContent=pct+'%';$('load-bar').style.width=pct+'%';},fail);
 lenis=new Lenis({duration:1.15,smoothWheel:true,anchors:false});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(time=>lenis.raf(time*1000));gsap.ticker.lagSmoothing(0);syncMotion();
 ScrollTrigger.create({trigger:'#journey',start:'top top',end:'bottom bottom',onUpdate:self=>{progress=self.progress;}});
 let previousProgress=-1,previousWidth=0,previousReduced=null,previousLoaded=false;const animate=()=>{requestAnimationFrame(animate);if(document.hidden)return;if(progress===previousProgress&&innerWidth===previousWidth&&reduced===previousReduced&&loaded===previousLoaded)return;renderWorld(progress);renderer.render(scene,camera);previousProgress=progress;previousWidth=innerWidth;previousReduced=reduced;previousLoaded=loaded;};animate();
 addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();ScrollTrigger.refresh();renderWorld(progress)});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fail('WebGL context lost. Please reload to restart the 3D journey.');});
}catch(e){fail(e)}

function addLine(points,color='#060a35',opacity=.25){const geo=new THREE.BufferGeometry().setFromPoints(points.map(V));const material=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});const line=new THREE.LineSegments(geo,material);planGroup.add(line);planLines.push({line,opacity,count:points.length});return line;}
function prepareModel(root){
 root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const scale=12/size.y;
 const glyphs={M:['10001','11011','10101','10101','10001','10001','10001'],A:['01110','11011','10001','11111','10001','10001','10001'],J:['11111','00010','00010','00010','10010','10010','01100'],E:['11111','10000','10000','11110','10000','10000','11111'],N:['10001','11001','11001','10101','10011','10011','10001'],T:['11111','00100','00100','00100','00100','00100','00100']};
 const targets=[];[...'MAJENTA'].forEach((l,li)=>glyphs[l].forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='1')targets.push(new THREE.Vector3((li*6+x-20)*.68,8+(3-y)*.8,0));})));
 const cutSegments=[];
 root.traverse(object=>{if(!object.isMesh)return;const geo=object.geometry.clone();const originalPosition=geo.attributes.position;const floatPosition=new Float32Array(originalPosition.count*3);for(let n=0;n<originalPosition.count;n++){floatPosition[n*3]=originalPosition.getX(n);floatPosition[n*3+1]=originalPosition.getY(n);floatPosition[n*3+2]=originalPosition.getZ(n);}geo.setAttribute('position',new THREE.BufferAttribute(floatPosition,3));geo.applyMatrix4(object.matrixWorld);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){pos.setXYZ(i,(pos.getX(i)-center.x)*scale,(pos.getY(i)-bounds.min.y)*scale,(pos.getZ(i)-center.z)*scale);}pos.needsUpdate=true;
 const indices=geo.index?.array||Uint32Array.from({length:pos.count},(_,i)=>i);const groups=new Map();
 // Spatial surface partitions use only triangles from the actual generated building.
 for(let k=0;k<indices.length;k+=3){let x=0,y=0,z=0;const ids=[indices[k],indices[k+1],indices[k+2]];for(const id of ids){x+=pos.getX(id)/3;y+=pos.getY(id)/3;z+=pos.getZ(id)/3;}const ix=Math.floor((x+6.1)/2),iy=Math.floor(y/1.5),iz=Math.floor((z+6.1)/2);const code=`${ix},${iy},${iz}`;if(!groups.has(code))groups.set(code,[]);groups.get(code).push(...ids);
  const ys=ids.map(id=>pos.getY(id));if(Math.min(...ys)<=1.2&&Math.max(...ys)>=1.2){const hits=[];for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],ya=pos.getY(a),yb=pos.getY(b);if((ya<1.2&&yb>=1.2)||(yb<1.2&&ya>=1.2)){const t=(1.2-ya)/(yb-ya);hits.push([THREE.MathUtils.lerp(pos.getX(a),pos.getX(b),t),.03,THREE.MathUtils.lerp(pos.getZ(a),pos.getZ(b),t)]);}}if(hits.length===2)cutSegments.push(...hits);}
 }
 modelMaterial=object.material.clone();modelMaterial.envMapIntensity=.6;modelMaterial.roughness=.78;modelMaterial.metalness=.05;modelMaterial.side=THREE.DoubleSide;
 for(const [code,ids]of groups){const partGeo=new THREE.BufferGeometry();for(const [name,attr]of Object.entries(geo.attributes))partGeo.setAttribute(name,attr);partGeo.setIndex(ids);const box=new THREE.Box3();for(const id of ids)box.expandByPoint(new THREE.Vector3(pos.getX(id),pos.getY(id),pos.getZ(id)));const c=box.getCenter(new THREE.Vector3()),sz=box.getSize(new THREE.Vector3());partGeo.boundingBox=box;partGeo.boundingSphere=box.getBoundingSphere(new THREE.Sphere());const mesh=new THREE.Mesh(partGeo,modelMaterial);mesh.frustumCulled=false;scene.add(mesh);pieces.push({mesh,center:c,size:sz,code,final:null});}
 });
 pieces.sort((a,b)=>a.center.y-b.center.y||a.center.x-b.center.x||a.center.z-b.center.z);
 pieces.forEach((part,i)=>{part.final=targets[i%targets.length].clone();part.final.z=(Math.floor(i/targets.length)-.5)*.38;const dims=part.size.toArray(),axis=dims.indexOf(Math.min(...dims));part.finalRotation=new THREE.Quaternion();const wanted=[.74,.86,.55];if(axis===1){part.finalRotation.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);wanted.splice(0,3,.74,.55,.86);}if(axis===0){part.finalRotation.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);wanted.splice(0,3,.55,.86,.74);}part.finalScale=new THREE.Vector3(...wanted.map((v,j)=>v/Math.max(dims[j],.08)));part.assemblyOffset=(part.center.y/12)*.11+Math.abs(part.center.x)/6*.015;});
 // One GPU draw call for all independently animated source surfaces.
 const count=pieces.reduce((n,part)=>n+part.mesh.geometry.index.count,0);
 const positions=new Float32Array(count*3),normals=new Float32Array(count*3),uvs=new Float32Array(count*2),partIds=new Float32Array(count);
 let cursor=0;
 pieces.forEach((part,partId)=>{const g=part.mesh.geometry,ix=g.index.array,a=g.attributes;for(const id of ix){positions[cursor*3]=a.position.getX(id);positions[cursor*3+1]=a.position.getY(id);positions[cursor*3+2]=a.position.getZ(id);normals[cursor*3]=a.normal.getX(id);normals[cursor*3+1]=a.normal.getY(id);normals[cursor*3+2]=a.normal.getZ(id);uvs[cursor*2]=a.uv.getX(id);uvs[cursor*2+1]=a.uv.getY(id);partIds[cursor]=partId;cursor++;}scene.remove(part.mesh);});
 const animatedGeometry=new THREE.BufferGeometry();animatedGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));animatedGeometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));animatedGeometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));animatedGeometry.setAttribute('partId',new THREE.BufferAttribute(partIds,1));
 matrixData=new Float32Array(pieces.length*16);matrixTexture=new THREE.DataTexture(matrixData,4,pieces.length,THREE.RGBAFormat,THREE.FloatType);matrixTexture.needsUpdate=true;
 modelMaterial.onBeforeCompile=shader=>{shader.uniforms.partMatrices={value:matrixTexture};shader.uniforms.partCount={value:pieces.length};shader.vertexShader='attribute float partId; uniform sampler2D partMatrices; uniform float partCount;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`float row=(partId+0.5)/partCount; mat4 pieceMatrix=mat4(texture2D(partMatrices,vec2(0.125,row)),texture2D(partMatrices,vec2(0.375,row)),texture2D(partMatrices,vec2(0.625,row)),texture2D(partMatrices,vec2(0.875,row)));\n#include <beginnormal_vertex>\nmat3 pieceNormal=mat3(cross(pieceMatrix[1].xyz,pieceMatrix[2].xyz),cross(pieceMatrix[2].xyz,pieceMatrix[0].xyz),cross(pieceMatrix[0].xyz,pieceMatrix[1].xyz));objectNormal=normalize(pieceNormal*objectNormal);`);shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=(pieceMatrix*vec4(transformed,1.0)).xyz;');};
 const animatedMesh=new THREE.Mesh(animatedGeometry,modelMaterial);animatedMesh.frustumCulled=false;animatedMesh.name='source-architectural-surfaces';scene.add(animatedMesh);window.__majentaAnimatedMesh=animatedMesh;
 if(cutSegments.length)addLine(cutSegments,'#060a35',.85);
 const grid=[];for(let i=-8;i<=8;i+=2){grid.push([i,.018,-8],[i,.018,8],[-8,.018,i],[8,.018,i]);}addLine(grid,'#060a35',.13);
 const dims=[];for(let i=-6;i<=6;i+=2){dims.push([i,.04,-7.5],[i,.04,-6.8]);}dims.push([-6,.04,-7.15],[6,.04,-7.15],[-7.1,.04,-6],[-7.1,.04,6]);addLine(dims,'#ff0099',.7);
 window.__majentaModel={parts:pieces.length,triangles:pieces.reduce((n,p)=>n+p.mesh.geometry.index.count/3,0),source:'Hyper3D Rodin',originalGeometryPreserved:true};
}


function renderWorld(raw){
 let p=clamp(raw,0,1);let ci=0;for(let i=0;i<landmarks.length;i++)if(p>=landmarks[i])ci=i;
 if(reduced)p=landmarks[ci];
 const next=Math.min(ci+1,14),local=next===ci?0:smooth(landmarks[ci],landmarks[next],p);
 if(camera){const a=frames[ci],b=frames[next];camera.position.copy(V(a.p)).lerp(V(b.p),local);target.copy(V(a.t)).lerp(V(b.t),local);const mobile=innerWidth<700;if(mobile){const opening=1-smooth(.24,.36,p),closing=smooth(.75,.90,p),distance=1+.85*opening+.95*closing;camera.position.sub(target).multiplyScalar(distance).add(target);target.y+=2.8*opening;}
 camera.fov=THREE.MathUtils.lerp(a.f,b.f,local)+(mobile&&ci>3&&ci<12?8:0);camera.lookAt(target);camera.updateProjectionMatrix();}
 if(ci!==lastChapter){lastChapter=ci;const c=chapters[ci];$('chapter-number').textContent=String(ci+1).padStart(2,'0');$('chapter-name').textContent=c[0];$('headline').replaceChildren(...c[1].split('\n').flatMap((s,i)=>i?[document.createElement('br'),document.createTextNode(s)]:[document.createTextNode(s)]));$('description').textContent=c[2];document.body.classList.toggle('inside',ci>=4&&ci<=10);document.body.classList.toggle('finished',ci===14);document.querySelectorAll('[data-index]').forEach((b,i)=>{const active=ci>=navIndices[i]&&(i===5||ci<navIndices[i+1]);b.setAttribute('aria-current',active?'step':'false');});}
 const footerFade=1-smooth(journeyEnd()-80,journeyEnd()+150,scrollY);document.querySelector('.narrative').style.opacity=footerFade;document.querySelector('#chapter-nav').style.opacity=footerFade;$('scroll-cue').style.opacity=(1-smooth(.035,.10,p))*footerFade;$('drawing-note').style.opacity=(1-smooth(.1,.22,p))*footerFade;$('progress-fill').style.width=(raw*100)+'%';$('progress-label').textContent=String(Math.round(raw*100)).padStart(3,'0');
 if(!loaded)return;
 const explode=smooth(.795,.865,p)*(1-smooth(.885,.95,p));const word=smooth(.87,.965,p);
 for(let partIndex=0;partIndex<pieces.length;partIndex++){const part=pieces[partIndex],m=part.mesh,c=part.center;const build=smooth(.065+part.assemblyOffset*.55,.15+part.assemblyOffset*.55,p);m.visible=p>.06;m.quaternion.identity();m.scale.set(1,Math.max(.001,build),1);m.position.set(0,c.y*(1-build)*-.04,0);
 if(explode>0){m.position.x=c.x*.38*explode;m.position.y=Math.floor(c.y/4)*2.5*explode;m.position.z=c.z*.38*explode;}
 if(word>0){const worldCenter=c.clone().multiply(m.scale).add(m.position);m.scale.lerp(part.finalScale,word);m.quaternion.slerp(part.finalRotation,word);const destination=worldCenter.lerp(part.final,word);scratch.copy(c).multiply(m.scale).applyQuaternion(m.quaternion);m.position.copy(destination).sub(scratch);}
 }
 pieces.forEach((part,i)=>{part.mesh.updateMatrix();part.mesh.matrix.toArray(matrixData,i*16);});if(matrixTexture)matrixTexture.needsUpdate=true;if(window.__majentaAnimatedMesh)window.__majentaAnimatedMesh.visible=p>.06;
 if(modelMaterial){modelMaterial.color.copy(sourceWhite).lerp(magenta,word*.94);modelMaterial.roughness=.78-word*.28;modelMaterial.metalness=.05+word*.25;}
 for(const row of planLines){row.line.material.opacity=row.opacity*(1-smooth(.16,.28,p)+.35*smooth(.8,.84,p)*(1-smooth(.86,.91,p)));row.line.geometry.setDrawRange(0,Math.floor(row.count*smooth(0,.07,p)/2)*2);}
 const interior=smooth(.3,.38,p)*(1-smooth(.68,.77,p));scene.background.copy(white).lerp(warm,interior*.4);key.intensity=1.7-interior*.6;interiorLight.intensity=14+interior*13;renderer.toneMappingExposure=.83+interior*.12;window.__majentaState={progress:raw,chapter:ci+1,camera:camera.position.toArray(),word,drawCalls:renderer.info.render.calls};
}
window.__majenta={setProgress(p){progress=clamp(p,0,1);lenis?.scrollTo(progress*journeyEnd(),{immediate:true});renderWorld(progress);},getState:()=>window.__majentaState,contactURL};
