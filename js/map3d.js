/* ============ NATIVE OPENFREEMAP 3D VIEW ============ */
(function(){
  const STYLE='https://tiles.openfreemap.org/styles/liberty';

  window.createRuto3DMap=function({mapElement,container,onClick,onDragStart,onError}){
    let map=null,loaded=false,reportedError=false,routeData={type:'FeatureCollection',features:[]},pendingBounds=null,pendingCamera=null;
    const markerItems=new Map(),markers=new Map(),sourceId=container.id+'-route';

    function renderMarker(key,item){
      const current=markers.get(key);
      if(current&&current.className===item.className&&current.html===item.html){
        current.marker.setLngLat([item.lng,item.lat]);
        current.element.title=item.label||'';
        window.updateRutoVehicleModel?.(current.element,item.bearing);
        return
      }
      if(current){window.disposeRutoVehicleModel?.(current.element);current.marker.remove()}
      const element=document.createElement('div');
      element.className='ruto-maplibre-marker '+(item.className||'');
      element.innerHTML=item.html||'';
      element.title=item.label||'';
      element.setAttribute('aria-label',item.label||'Map marker');
      const marker=new maplibregl.Marker({element,anchor:item.anchor||'center'})
        .setLngLat([item.lng,item.lat]);
      if(item.popup)marker.setPopup(new maplibregl.Popup({offset:18}).setText(item.popup));
      marker.addTo(map);markers.set(key,{marker,element,className:item.className,html:item.html});
      window.renderRutoVehicleModel?.(element,item.bearing)
    }

    function syncData(){
      if(!loaded)return;
      const source=map.getSource(sourceId);
      if(source)source.setData(routeData);
      markerItems.forEach((item,key)=>renderMarker(key,item))
    }

    function addRouteLayers(){
      if(!map.getSource(sourceId))map.addSource(sourceId,{type:'geojson',data:routeData});
      const before=map.getStyle().layers.find(layer=>layer.type==='symbol')?.id;
      const add=layer=>{if(!map.getLayer(layer.id))map.addLayer(layer,before)};
      add({id:sourceId+'-casing',type:'line',source:sourceId,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#fff','line-width':9,'line-opacity':.85}});
      add({id:sourceId+'-land',type:'line',source:sourceId,filter:['==',['get','water'],false],
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#FFD700','line-width':5,'line-opacity':.96}});
      add({id:sourceId+'-water',type:'line',source:sourceId,filter:['==',['get','water'],true],
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#737373','line-width':4,'line-dasharray':[2,2]}})
    }

    function fitPoints(points){
      if(container.hidden||!points?.length)return;
      const valid=points.filter(point=>Number.isFinite(point.lat)&&Number.isFinite(point.lng));
      if(!valid.length)return;
      if(!loaded){pendingBounds=valid;pendingCamera=null;return}
      if(valid.length===1){map.easeTo({center:[valid[0].lng,valid[0].lat],zoom:16,pitch:52,duration:350});return}
      const bounds=new maplibregl.LngLatBounds();
      valid.forEach(point=>bounds.extend([point.lng,point.lat]));
      map.fitBounds(bounds,{padding:40,maxZoom:15,pitch:52,duration:400})
    }

    function flyTo(point,zoom,duration){
      if(container.hidden)return;
      const camera={center:[point.lng,point.lat],zoom,pitch:52,duration};
      if(loaded)map.easeTo(camera);else{pendingCamera=camera;pendingBounds=null}
    }

    function ensureMap(view){
      if(map)return;
      if(!window.maplibregl?.Map)throw new Error('MapLibre GL is unavailable');
      map=new maplibregl.Map({
        container,style:STYLE,center:[view.lng,view.lat],zoom:view.zoom||14,
        pitch:52,bearing:0,maxPitch:60,antialias:true,attributionControl:false
      });
      map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-left');
      map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
      map.on('load',()=>{
        loaded=true;addRouteLayers();syncData();
        if(pendingBounds){const points=pendingBounds;pendingBounds=null;fitPoints(points)}
        else if(pendingCamera){map.easeTo(pendingCamera);pendingCamera=null}
      });
      map.on('click',event=>onClick?.({lat:event.lngLat.lat,lng:event.lngLat.lng}));
      map.on('dragstart',()=>onDragStart?.());
      map.on('error',event=>{
        if(reportedError||!event.error)return;
        reportedError=true;console.error('OpenFreeMap 3D view failed to load.',event.error);onError?.(event.error)
      })
    }

    return{
      get visible(){return !container.hidden},
      get map(){return map},
      setVisible(visible,view){
        if(!visible){
          const center=map?.getCenter();
          const currentView=center?{center:{lat:center.lat,lng:center.lng},zoom:map.getZoom()}:null;
          container.hidden=true;mapElement.hidden=false;
          return currentView
        }
        mapElement.hidden=true;container.hidden=false;
        const center=view?.center||view||{lat:14.5995,lng:120.9842};
        ensureMap({lat:center.lat,lng:center.lng,zoom:view?.zoom||14});
        const camera={center:[center.lng,center.lat],zoom:view?.zoom||14,pitch:52,bearing:0,duration:350};
        if(loaded)map.easeTo(camera);else{pendingCamera=camera;pendingBounds=null}
        requestAnimationFrame(()=>map?.resize());
        return null
      },
      setRoute(segments){
        routeData={type:'FeatureCollection',features:(segments||[]).filter(segment=>segment.path?.length>1).map(segment=>({
          type:'Feature',properties:{water:!!segment.water},
          geometry:{type:'LineString',coordinates:segment.path.map(point=>[point[1],point[0]])}
        }))};
        const source=loaded&&map.getSource(sourceId);
        if(source)source.setData(routeData)
      },
      setMarker(group,id,item){
        const key=group+':'+id;markerItems.set(key,item);
        if(loaded)renderMarker(key,item)
      },
      setMarkers(group,items){
        const prefix=group+':';
        for(const key of markerItems.keys())if(key.startsWith(prefix)){
          markerItems.delete(key);
          const current=markers.get(key);
          if(current){window.disposeRutoVehicleModel?.(current.element);current.marker.remove()}
          markers.delete(key)
        }
        (items||[]).forEach((item,index)=>this.setMarker(group,item.id??index,item))
      },
      fitPoints,
      flyTo(point,zoom=16,duration=250){flyTo(point,zoom,duration)}
    }
  }
})();
