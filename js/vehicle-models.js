(function(){
  const renderers=new WeakMap(),pending=new WeakSet();
  let threeModule;
  const moduleUrl=new URL('js/vendor/three.module.js',document.baseURI).href;
  const SIZE=96;
  const MODEL_IDS=new Set(['moto','etrike','trike','car','jeep','van','pickup','t2','t5','t10','bangka','cargo']);
  const COLOR={gold:0xE4B323,lightGold:0xFFD95A,darkGold:0xA77808,black:0x171A1F,rubber:0x20242A,glass:0x16384C,chrome:0xCAD1D8,white:0xFFF2C2,red:0xB52B22};

  function material(T,color,metalness=0,roughness=.38){
    return new T.MeshStandardMaterial({color,metalness,roughness})
  }
  function addBox(T,parent,w,h,l,mat,x,y,z){
    const mesh=new T.Mesh(new T.BoxGeometry(w,h,l),mat);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh
  }
  function addRod(T,parent,a,b,radius,mat){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),direction=end.clone().sub(start);
    const rod=new T.Mesh(new T.CylinderGeometry(radius,radius,direction.length(),8),mat);
    rod.position.copy(start).add(end).multiplyScalar(.5);
    rod.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
    parent.add(rod);return rod
  }
  function addWheel(T,parent,x,z,radius=.38){
    const tireMat=material(T,COLOR.rubber,0,.78),rimMat=material(T,COLOR.chrome,.78,.26),hubMat=material(T,COLOR.gold,.62,.25);
    const tire=new T.Mesh(new T.CylinderGeometry(radius,radius,.24,18),tireMat);
    tire.rotation.z=Math.PI/2;tire.position.set(x,radius,z);parent.add(tire);
    [-1,1].forEach(side=>{
      const rim=new T.Mesh(new T.CylinderGeometry(radius*.54,radius*.54,.035,16),rimMat);
      rim.rotation.z=Math.PI/2;rim.position.set(x+side*.135,radius,z);parent.add(rim);
      const hub=new T.Mesh(new T.CylinderGeometry(radius*.2,radius*.2,.045,12),hubMat);
      hub.rotation.z=Math.PI/2;hub.position.set(x+side*.16,radius,z);parent.add(hub)
    })
  }
  function addCarWheels(T,group,width,positions, radius=.38){
    positions.forEach(z=>[-1,1].forEach(side=>addWheel(T,group,side*width/2,z,radius)))
  }
  function addFrontDetails(T,group,width,z){
    const chrome=material(T,COLOR.chrome,.72,.24),lamp=material(T,COLOR.white,.2,.2),dark=material(T,COLOR.black,.15,.4);
    addBox(T,group,width*.42,.18,.045,dark,0,.61,z-.025);
    addBox(T,group,width*.18,.12,.035,chrome,0,.61,z-.052);
    [-1,1].forEach(side=>{
      addBox(T,group,.18,.105,.05,lamp,side*width*.34,.78,z-.04);
      addBox(T,group,.13,.09,.04,material(T,COLOR.red),side*width*.35,.7,z+.035)
    })
  }
  function addRoadCab(T,group,options){
    const {width=1.5,length=1.55,centerZ=0,roofY=1.48,paint,glass,boxy=false}=options;
    const h=boxy?0.82:0.68,y=.9;
    addBox(T,group,width,h,length,paint,0,y,centerZ);
    addBox(T,group,width*.88,.12,length*.78,paint,0,y+h/2+.05,centerZ-.02);
    const frontZ=centerZ-length/2-.022;
    const windshield=addBox(T,group,width*.72,.34,.035,glass,0,y+.04,frontZ);
    windshield.rotation.x=-.12;
    [-1,1].forEach(side=>{
      addBox(T,group,.035,.3,length*.58,glass,side*(width/2+.015),y+.08,centerZ);
      if(boxy)addBox(T,group,.035,.2,.32,material(T,COLOR.gold,.25,.3),side*(width/2+.025),y+.02,centerZ+length*.18)
    });
    addBox(T,group,width*.72,.06,.12,material(T,COLOR.darkGold,.3,.3),0,roofY,centerZ-.02)
  }
  function addTruckBody(T,group,{width,length,height,centerZ,paint,wing=false}){
    const y=.53+height/2,container=addBox(T,group,width,height,length,paint,0,y,centerZ);
    container.material=paint;
    const trim=material(T,COLOR.darkGold,.38,.35),chrome=material(T,COLOR.chrome,.7,.28);
    addBox(T,group,width*.97,.065,length*.98,chrome,0,.55+height,centerZ);
    const panelCount=Math.max(3,Math.floor(length*2.2));
    for(let i=1;i<panelCount;i++){
      const z=centerZ-length/2+length*i/panelCount;
      [-1,1].forEach(side=>addBox(T,group,.025,height*.78,.025,trim,side*(width/2+.014),y,z))
    }
    if(wing){
      [-1,1].forEach(side=>{
        const panel=addBox(T,group,.07,height*.8,length*.9,paint,side*(width/2+.2),y+height*.31,centerZ);
        panel.rotation.z=side*.45
      })
    }
  }
  function addMotorcycle(T,group,{sidecar=false,electric=false}={}){
    const frame=material(T,COLOR.darkGold,.55,.3),paint=material(T,electric?0xE6C443:COLOR.gold,.46,.3),seat=material(T,COLOR.black,.05,.72);
    addWheel(T,group,0,-1.05,.34);addWheel(T,group,0,1.05,.34);
    addRod(T,group,[0,.56,-.88],[0,.92,-.13],.075,frame);
    addRod(T,group,[0,.56,-.88],[0,.76,.58],.065,frame);
    addRod(T,group,[0,.76,.58],[0,.92,-.13],.055,frame);
    addBox(T,group,.48,.28,.58,paint,0,1.0,-.17);
    addBox(T,group,.38,.13,.65,seat,0,1.18,.48);
    addBox(T,group,.16,.12,.34,paint,0,.89,.73);
    addRod(T,group,[0,.86,-.45],[0,1.25,-.87],.045,chromeFor(T));
    addRod(T,group,[-.38,1.25,-.87],[.38,1.25,-.87],.045,frame);
    const head=new T.Mesh(new T.SphereGeometry(.16,14,10),material(T,COLOR.white,.18,.2));
    head.position.set(0,1.15,-.94);group.add(head);
    addBox(T,group,.5,.08,.2,seat,0,.78,.86);
    if(sidecar){
      addRod(T,group,[.2,.72,.22],[.88,.72,.38],.045,frame);
      addBox(T,group,.78,.5,1.0,paint,.94,.68,.38);
      addBox(T,group,.68,.08,.88,seat,.94,.98,.38);
      addWheel(T,group,.95,.8,.31);
      addBox(T,group,.84,.08,.12,paint,.94,1.15,.38)
    }
  }
  function chromeFor(T){return material(T,COLOR.chrome,.72,.24)}
  function addBoatHull(T,group,width,length,paint){
    const shape=new T.Shape();
    shape.moveTo(-width*.45,length*.5);
    shape.lineTo(width*.45,length*.5);
    shape.lineTo(width*.4,-length*.24);
    shape.quadraticCurveTo(width*.32,-length*.42,0,-length*.5);
    shape.quadraticCurveTo(-width*.32,-length*.42,-width*.4,-length*.24);
    shape.closePath();
    const hullGeometry=new T.ExtrudeGeometry(shape,{depth:.38,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.045,bevelThickness:.045});
    hullGeometry.rotateX(Math.PI/2);
    hullGeometry.translate(0,.43,0);
    group.add(new T.Mesh(hullGeometry,paint))
  }
  function addBangka(T,group){
    const hull=material(T,0xC98C21,.38,.36),deck=material(T,0xF1C34A,.22,.52),wood=material(T,0x8B5C22,.15,.58),dark=material(T,COLOR.black,.12,.6);
    addBoatHull(T,group,.92,3.8,hull);
    addBox(T,group,.68,.09,2.95,deck,0,.41,.02);
    [-1,1].forEach(side=>{
      addRod(T,group,[side*.38,.48,-.9],[side*1.12,.25,-.96],.045,material(T,COLOR.chrome,.7,.3));
      addRod(T,group,[side*.38,.48,.92],[side*1.12,.25,.96],.045,material(T,COLOR.chrome,.7,.3));
      const float=new T.Mesh(new T.CylinderGeometry(.13,.16,2.9,12),hull);
      float.rotation.x=Math.PI/2;float.position.set(side*1.14,.2,0);group.add(float)
    });
    [-.72,.05,.75].forEach(z=>addBox(T,group,.72,.09,.16,wood,0,.57,z));
    addBox(T,group,.42,.3,.56,deck,0,.79,.05);
    addBox(T,group,.5,.07,.68,wood,0,1.0,.05);
    addBox(T,group,.28,.16,.24,dark,0,.32,1.52)
  }
  function addCargoBoat(T,group){
    const hull=material(T,0x394550,.5,.36),deck=material(T,0xD2A32C,.32,.4),container=material(T,0xBA8A19,.46,.34),light=material(T,0xE6BE52,.4,.34);
    addBoatHull(T,group,1.9,4.7,hull);
    addBox(T,group,1.52,.12,3.78,deck,0,.4,.03);
    const containerPositions=[[-.42,-.22],[.42,-.22],[-.42,.84],[.42,.84],[0,-1.12]];
    containerPositions.forEach(([x,z],index)=>{
      const width=index===4?1.05:.68,length=index===4?.72:.92;
      addBox(T,group,width,.7,length,index===4?light:container,x,.84,z);
      for(let i=1;i<4;i++)addBox(T,group,.018,.58,.02,material(T,COLOR.darkGold,.32,.38),x-width/2+width*i/4,.84,z)
    });
    addBox(T,group,.82,.95,.84,light,0,.92,1.58);
    addBox(T,group,.62,.28,.05,material(T,COLOR.glass,.25,.2),0,1.05,1.14);
    addBox(T,group,.18,.12,.3,material(T,COLOR.red),0,.46,2.1)
  }
  function buildModel(T,id){
    if(!MODEL_IDS.has(id))throw new RangeError(`Unsupported RUTO vehicle model: ${id}`);
    const scene=new T.Scene(),group=new T.Group();
    const gold=material(T,COLOR.gold,.42,.32),bright=material(T,COLOR.lightGold,.46,.28),darkGold=material(T,COLOR.darkGold,.48,.36),black=material(T,COLOR.black,.08,.62),glass=material(T,COLOR.glass,.26,.2),chrome=chromeFor(T);

    if(id==='bangka'){addBangka(T,group)}
    else if(id==='cargo'){addCargoBoat(T,group)}
    else if(id==='moto'){addMotorcycle(T,group)}
    else if(id==='trike'){addMotorcycle(T,group,{sidecar:true})}
    else if(id==='etrike'){
      const paint=material(T,0xDDB72F,.38,.35);
      [-1,1].forEach(side=>addWheel(T,group,side*.57,.62,.33));
      addWheel(T,group,0,-1.0,.34);
      addBox(T,group,1.35,.48,2.18,paint,0,.72,-.03);
      addBox(T,group,1.48,.08,1.92,bright,0,1.02,-.08);
      addBox(T,group,1.2,.12,1.1,black,0,1.11,-.18);
      addBox(T,group,1.28,.08,1.46,bright,0,1.74,-.08);
      addBox(T,group,.9,.42,.04,glass,0,1.42,-.88);
      addBox(T,group,.08,.75,.08,chrome,-.62,1.34,.42);
      addBox(T,group,.08,.75,.08,chrome,.62,1.34,.42);
      addFrontDetails(T,group,1.32,-1.16)
    }else if(id==='car'){
      addBox(T,group,1.72,.4,3.28,gold,0,.64,0);
      addBox(T,group,1.52,.3,.86,bright,0,.83,-1.16);
      addBox(T,group,1.46,.31,.62,darkGold,0,.82,1.21);
      addRoadCab(T,group,{width:1.38,length:1.52,centerZ:-.05,roofY:1.52,paint:bright,glass});
      addCarWheels(T,group,1.75,[-1.02,1.03],.37);
      addFrontDetails(T,group,1.62,-1.66)
    }else if(id==='jeep'){
      addBox(T,group,1.82,.48,3.78,gold,0,.66,0);
      addRoadCab(T,group,{width:1.76,length:2.52,centerZ:.1,roofY:1.66,paint:bright,glass,boxy:true});
      addCarWheels(T,group,1.86,[-1.28,1.2],.4);
      [-1,1].forEach(side=>[-.65,.05,.73].forEach(z=>addBox(T,group,.035,.25,.36,glass,side*.9,1.06,z)));
      addFrontDetails(T,group,1.76,-1.91);
      addBox(T,group,1.7,.12,.14,chrome,0,.38,-1.95)
    }else if(id==='van'){
      addBox(T,group,1.82,.52,3.65,gold,0,.66,.05);
      addBox(T,group,1.68,1.14,2.38,bright,0,1.39,.42);
      addRoadCab(T,group,{width:1.68,length:.92,centerZ:-1.22,roofY:2.02,paint:bright,glass,boxy:true});
      addCarWheels(T,group,1.86,[-1.23,1.28],.4);
      [-1,1].forEach(side=>addBox(T,group,.035,.48,.76,glass,side*.86,1.49,-1.17));
      addFrontDetails(T,group,1.72,-1.72)
    }else if(id==='pickup'){
      addBox(T,group,1.82,.45,3.35,gold,0,.65,0);
      addRoadCab(T,group,{width:1.58,length:1.4,centerZ:-.68,roofY:1.63,paint:bright,glass});
      addBox(T,group,1.34,.07,1.13,darkGold,0,.91,.94);
      [-1,1].forEach(side=>{
        addBox(T,group,.12,.34,1.3,bright,side*.73,.99,.93);
        addBox(T,group,.14,.08,1.27,chrome,side*.73,1.18,.93)
      });
      addCarWheels(T,group,1.86,[-1.02,1.15],.39);
      addFrontDetails(T,group,1.62,-1.7)
    }else if(id==='t2'||id==='t5'||id==='t10'){
      const isT2=id==='t2',isT5=id==='t5',isWing=id==='t10';
      const width=isT2?1.85:2.02,length=isT2?2.45:isT5?3.15:3.72,height=isT2?1.22:isT5?1.42:1.55;
      const centerZ=.56,frontZ=centerZ-length/2-.54;
      addBox(T,group,width,.43,length+1.05,gold,0,.62,.18);
      addTruckBody(T,group,{width:width*.96,length,height,centerZ,paint:isWing?bright:gold,wing:isWing});
      addRoadCab(T,group,{width:1.56,length:1.08,centerZ:frontZ+.02,roofY:1.7,paint:bright,glass,boxy:true});
      const axles=isT2?[-1.06,1.03]:isT5?[-1.13,.91,1.52]:[-1.34,.1,.82,1.54,2.1];
      addCarWheels(T,group,width+.06,axles,isT2?.39:.43);
      addFrontDetails(T,group,1.58,frontZ-.56);
      addBox(T,group,width*.94,.08,.12,chrome,0,.4,frontZ-.58)
    }
    group.userData.vehicleModelId=id;
    scene.add(group);
    const camera=new T.PerspectiveCamera(27,1,.1,80);
    const bounds=new T.Box3().setFromObject(group),center=bounds.getCenter(new T.Vector3());
    const radius=bounds.getBoundingSphere(new T.Sphere()).radius;
    const direction=new T.Vector3(.55,.58,-.6).normalize();
    camera.position.copy(center).add(direction.multiplyScalar(Math.max(5,radius*4.8)));
    camera.lookAt(center);
    scene.add(new T.HemisphereLight(0xfff4d0,0x263244,2.0));
    const key=new T.DirectionalLight(0xffffff,3.2);key.position.set(-5,9,-7);scene.add(key);
    const fill=new T.DirectionalLight(0x9ac4ff,1.15);fill.position.set(7,4,6);scene.add(fill);
    return{scene,camera,group}
  }
  function setBearing(instance,bearing){
    const value=Number.isFinite(bearing)?-bearing*Math.PI/180:0;
    if(Math.abs(instance.group.rotation.y-value)<.015)return;
    instance.group.rotation.y=value;
    instance.renderer.render(instance.scene,instance.camera)
  }
  function render(element,bearing){
    const canvas=element?.querySelector('.vehicle-3d-canvas'),stage=canvas?.parentElement;
    if(!canvas||!stage)return;
    canvas.dataset.bearing=Number.isFinite(bearing)?String(bearing):'0';
    const current=renderers.get(canvas);
    if(current){setBearing(current,bearing);return}
    if(pending.has(canvas))return;
    pending.add(canvas);
    threeModule=threeModule||import(moduleUrl);
    threeModule.then(T=>{
      pending.delete(canvas);
      if(!canvas.isConnected)return;
      try{
        const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
        renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
        renderer.setSize(SIZE,SIZE,false);
        renderer.outputColorSpace=T.SRGBColorSpace;
        renderer.toneMapping=T.ACESFilmicToneMapping;
        renderer.toneMappingExposure=1.13;
        const model=buildModel(T,canvas.dataset.vehicleId);
        canvas.dataset.renderedModelId=model.group.userData.vehicleModelId;
        const instance={...model,renderer};
        renderers.set(canvas,instance);stage.classList.add('is-rendered');
        setBearing(instance,Number(canvas.dataset.bearing));renderer.render(instance.scene,instance.camera)
      }catch(error){
        stage.classList.add('model-fallback');
        console.warn('3D vehicle rendering is unavailable; using the vehicle fallback marker.',error)
      }
    }).catch(error=>{
      pending.delete(canvas);stage.classList.add('model-fallback');
      console.warn('Could not load the local Three.js vehicle renderer.',error)
    })
  }
  function dispose(element){
    const canvas=element?.querySelector('.vehicle-3d-canvas'),instance=canvas&&renderers.get(canvas);
    if(!instance)return;
    instance.scene.traverse(object=>{
      if(object.geometry)object.geometry.dispose();
      if(object.material){
        const materials=Array.isArray(object.material)?object.material:[object.material];
        materials.forEach(item=>item.dispose())
      }
    });
    instance.renderer.dispose();instance.renderer.forceContextLoss();
    renderers.delete(canvas)
  }
  window.renderRutoVehicleModel=render;
  window.updateRutoVehicleModel=render;
  window.disposeRutoVehicleModel=dispose
})();
