/* ============ NEARBY PLACE SEARCH (OpenStreetMap / Overpass + Photon) ============ */
const PLACE_CATEGORIES=[
 {id:'delivery_hubs',k:'poiGroupDelivery',categories:[
  {id:'groceries',k:'poiCatGroceries',icon:'g-basket',badge:'G',color:'#FFD700',q:['["shop"~"^(supermarket|grocery|greengrocer)$"]'],photonQueries:['supermarket','grocery store'],photonTags:['shop=supermarket','shop=grocery','shop=greengrocer'],re:/grocer|supermarket|grocery|pamilihan/i,vehicles:['trike','jeep','van']},
  {id:'convenience_stores',k:'poiCatConvenience',icon:'g-store',badge:'C',color:'#F0F1F2',q:['["shop"~"^(convenience|kiosk|mini_market)$"]'],photonQueries:['convenience store'],photonTags:['shop=convenience','shop=kiosk','shop=mini_market'],re:/convenience|7-?eleven|tindahan/i,vehicles:['trike','jeep','van']},
  {id:'shopping_centers',k:'poiCatShopping',icon:'g-bag',badge:'S',color:'#D4D4D4',q:['["shop"~"^(mall|department_store)$"]'],photonQueries:['shopping mall','department store'],photonTags:['shop=mall','shop=department_store'],re:/shopping|mall|department store/i,vehicles:['van','t2','t5']},
  {id:'mail_shipping',k:'poiCatMail',icon:'g-box',badge:'M',color:'#666666',markerInk:'#fff',q:['["amenity"~"^(post_office|parcel_locker)$"]','["shop"="shipping"]'],photonQueries:['post office','parcel locker'],photonTags:['amenity=post_office','amenity=parcel_locker','shop=shipping'],re:/post office|mail|shipping|parcel|courier|koreo|padala/i,vehicles:['van','pickup','t2']},
  {id:'restaurants',k:'poiCatRestaurants',icon:'g-food',badge:'R',color:'#fff',q:['["amenity"~"^(restaurant|fast_food|food_court)$"]','["takeaway"="yes"]'],photonQueries:['restaurant'],photonTags:['amenity=restaurant','amenity=fast_food','amenity=food_court','takeaway=yes'],re:/restaurant|takeout|takeaway|\bresto\b|karinderya|carinderia|kainan/i,vehicles:['trike','jeep','van']}
 ]},
 {id:'route_support',k:'poiGroupRoute',categories:[
  {id:'gas',k:'poiCatGas',icon:'g-fuel',badge:'F',color:'#FFD700',q:['["amenity"="fuel"]'],photonQueries:['gas station','fuel'],photonTags:['amenity=fuel'],re:/gas(oline|olina)?\s*-?station|gasolin|magpa-?gas|magpakarga|diesel|krudo|petron|\bshell\b|caltex|\bfuel\b|\bgas\b/i,vehicles:['trike','jeep','van','t2']},
  {id:'parking',k:'poiCatParking',icon:'g-parking',badge:'P',color:'#353839',markerInk:'#fff',q:['["amenity"="parking"]'],photonQueries:['parking'],photonTags:['amenity=parking'],re:/parking|paradahan/i,vehicles:['car','trike','van']},
  {id:'charging_stations',k:'poiCatCharging',icon:'g-bolt',badge:'E',color:'#D4D4D4',q:['["amenity"="charging_station"]'],photonQueries:['EV charging station','electric vehicle charging'],photonTags:['amenity=charging_station'],re:/charging|charger|mag-?charge/i,vehicles:['etrike','car','van']},
  {id:'atm',k:'poiCatAtm',icon:'g-bank',badge:'A',color:'#666666',markerInk:'#fff',q:['["amenity"="atm"]'],photonQueries:['ATM'],photonTags:['amenity=atm'],re:/\batm\b|cash machine|withdraw/i,vehicles:['car','trike']},
  {id:'hospitals_clinics',k:'poiCatHospitals',icon:'g-medical',badge:'H',color:'#F0F1F2',q:['["amenity"~"^(hospital|clinic|doctors)$"]'],photonQueries:['hospital','clinic'],photonTags:['amenity=hospital','amenity=clinic','amenity=doctors'],re:/hospital|ospital|clinic|klinika|doctor/i,vehicles:['car','van','jeep']}
 ]}
];
const PLACE_CATEGORY_BY_ID=Object.fromEntries(PLACE_CATEGORIES.flatMap(group=>group.categories.map(category=>[category.id,{...category,groupId:group.id,groupKey:group.k}])));
const CATS=PLACE_CATEGORY_BY_ID;
let preferredOverpass=0;
async function overpass(query){
  const endpoints=RUTO.OVERPASS||[],deadline=Date.now()+16000;
  let err;
  for(let offset=0;offset<endpoints.length;offset++){
    const index=(preferredOverpass+offset)%endpoints.length,url=endpoints[index],remaining=deadline-Date.now();
    if(remaining<=0)break;
    try{
      const j=await getJSON(url,{method:'POST',headers:{Accept:'application/json'},body:new URLSearchParams({data:query})},Math.min(8000,remaining));
      if(!Array.isArray(j?.elements))throw new Error('Overpass returned an invalid places response');
      preferredOverpass=index;
      return j.elements
    }catch(error){err=error}
  }
  throw err||new Error('places')}
async function photonPlaces(category,term,at,radiusKm,limit){
  const cat=CATS[category],radiusLat=radiusKm/111.32,radiusLng=radiusKm/(111.32*Math.max(.01,Math.cos(at.lat*Math.PI/180))),
    bounds=[Math.max(-180,at.lng-radiusLng),Math.max(-90,at.lat-radiusLat),Math.min(180,at.lng+radiusLng),Math.min(90,at.lat+radiusLat)],
    queries=term?[term]:cat.photonQueries;
  const responses=await Promise.all(queries.map(async query=>{
    const params=new URLSearchParams({q:query,lat:String(at.lat),lon:String(at.lng),limit:'50',lang:'en',
      bbox:bounds.map(value=>value.toFixed(6)).join(',')});
    try{return{json:await getJSON(`https://photon.komoot.io/api/?${params}`,{headers:{Accept:'application/geo+json, application/json'}},9000)}}
    catch(error){return{error}}
  }));
  const collections=responses.map(response=>response.json).filter(json=>Array.isArray(json?.features));
  if(!collections.length)throw responses.find(response=>response.error)?.error||new Error('Photon returned an invalid places response');
  const acceptedTags=new Set(cat.photonTags||[]);
  const uniqueFeatures=new Map();
  collections.flatMap(collection=>collection.features).forEach(feature=>{
    const properties=feature.properties||{},coordinates=feature.geometry?.coordinates||[],keyValue=`${properties.osm_key}=${properties.osm_value}`,
      name=properties.name||properties.street||'';
    if(!acceptedTags.has(keyValue)&&!cat.re.test(name))return;
    const id=properties.osm_type&&properties.osm_id?`${properties.osm_type}/${properties.osm_id}`:`${name.toLowerCase()}/${coordinates.join(',')}`;
    if(uniqueFeatures.has(id))return;
    const place={lat:Number(coordinates[1]),lng:Number(coordinates[0]),categoryId:category,name:name||t(cat.k),
      info:[properties.street,properties.city,properties.state].filter(Boolean).join(', ')};
    place.km=hav(at,place);
    if(Number.isFinite(place.lat)&&Number.isFinite(place.lng)&&place.km<=radiusKm)uniqueFeatures.set(id,place)
  });
  if(limit<=0)return[];
  const places=[];
  for(const place of [...uniqueFeatures.values()].sort((a,b)=>a.km-b.km)){
    const duplicate=places.some(existing=>existing.name.trim().toLowerCase()===place.name.trim().toLowerCase()&&hav(existing,place)<.03);
    if(duplicate)continue;
    places.push(place);
    if(places.length>=limit)break
  }
  return places
}
const placesCache=new Map();
async function findPlaces(category,name,limit=5,options={}){
  const at=options.at,radius=options.radius||30000,radiusKm=options.radiusKm??radius/1000,maxResults=options.maxResults||600,cat=CATS[category];
  const term=String(name||'').replace(/[^\p{L}\p{N} '&-]/gu,'').trim().slice(0,40);
  const filters=term?[(cat?cat.q[0]:'')+`["name"~"${term}",i]`]:cat?.q;
  if(!at||!filters||!Number.isFinite(at.lat)||!Number.isFinite(at.lng))return{places:[],at};
  const cacheKey=[category||'',term.toLowerCase(),at.lat.toFixed(4),at.lng.toFixed(4),limit,radius,maxResults].join('|'),cached=placesCache.get(cacheKey);
  if(cached&&Date.now()-cached.at<60000)return{...cached.result,places:cached.places};
  let places;
  try{
    const els=await overpass(`[out:json][timeout:8];(${filters.map(f=>`nwr${f}(around:${radius},${at.lat},${at.lng});`).join('')});out center ${maxResults};`),
      uniqueElements=new Map(els.map(element=>[`${element.type||''}/${element.id??`${element.lat},${element.lon}`}`,element]));
    places=[...uniqueElements.values()].map(element=>{
      const location=element.center||element,tags=element.tags||{},place={lat:location.lat,lng:location.lon,categoryId:category,
        name:tags.name||tags.brand||t(cat?.k||'place'),
        info:[tags.brand&&tags.brand!==tags.name?tags.brand:'',[tags['addr:street'],tags['addr:city']].filter(Boolean).join(', '),tags.opening_hours].filter(Boolean).join(' · ')};
      place.km=hav(at,place);return place
    }).filter(place=>Number.isFinite(place.lat)&&Number.isFinite(place.lng)&&place.km<=radiusKm).sort((a,b)=>a.km-b.km).slice(0,limit)
  }catch(overpassError){
    if(!cat?.photonQueries)throw overpassError;
    try{places=await photonPlaces(category,term,at,radiusKm,limit)}
    catch(photonError){console.warn('Overpass and Photon nearby search failed.',{overpassError,photonError});throw photonError}
  }
  const result={at,radiusKm,label:term||t(cat?.k||'place'),usingGps:!!(NAV.position||st.me)};
  placesCache.set(cacheKey,{at:Date.now(),places,result});
  return{places,...result}}

let mapPoiLayer=null,mapPoiSearchLayer=null,mapPoiRequest=0,activeMapCategory='',lastMapPoiResult=null;
function clearPoiSearchPulse(){
  if(mapPoiSearchLayer)mapPoiSearchLayer.clearLayers();
  planner3D?.setMarkers('poi-search',[])
}
function showPoiSearchPulse(point){
  const html='<span class="poi-search-ripple" aria-hidden="true"><span></span><span></span><span></span><i></i></span>',
    icon=L.divIcon({className:'poi-search-map-marker',html,iconSize:[68,68],iconAnchor:[34,34]});
  if(!mapPoiSearchLayer)mapPoiSearchLayer=L.layerGroup().addTo(map);
  mapPoiSearchLayer.clearLayers();
  L.marker(point,{icon,interactive:false,zIndexOffset:1200}).addTo(mapPoiSearchLayer);
  planner3D?.setMarkers('poi-search',[{
    id:'active',lat:point.lat,lng:point.lng,html,className:'poi-search-map-marker',label:t('poiSearching')
  }])
}
function mapCategoryButton(category){
  const button=document.createElement('button'),badge=document.createElement('span'),icon=document.createElementNS('http://www.w3.org/2000/svg','svg'),
    use=document.createElementNS('http://www.w3.org/2000/svg','use'),label=document.createElement('span');
  button.type='button';button.className='map-category-chip';button.dataset.poiCat=category.id;
  button.style.setProperty('--poi-color',category.color);button.style.setProperty('--poi-marker-ink',category.markerInk||'#353839');button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',t(category.k));
  badge.className='map-category-badge';badge.textContent=category.badge;badge.setAttribute('aria-hidden','true');
  icon.classList.add('i','map-category-glyph');icon.setAttribute('aria-hidden','true');use.setAttribute('href','#'+category.icon);icon.append(use);
  label.textContent=t(category.k);button.append(badge,icon,label);
  button.onclick=()=>searchMapCategory(category.id);
  return button
}
function updatePoiAnchorOptions(){
  const select=$('#poiAnchor');if(!select)return;
  const current=select.value||'auto',options=[{value:'auto',label:t('poiAnchorAuto')}];
  options.push({value:'gps',label:t('poiAnchorGps')});
  if(st.origin)options.push({value:'pickup',label:t('poiAnchorPickup')});
  st.stops.forEach((stop,index)=>options.push({value:'drop:'+index,label:t('poiAnchorDropoff',{n:index+1})}));
  options.push({value:'map',label:t('poiAnchorMap')});
  select.replaceChildren(...options.map(option=>{const el=document.createElement('option');el.value=option.value;el.textContent=option.label;return el}));
  select.value=options.some(option=>option.value===current)?current:'auto'
}
function poiAnchor(){
  updatePoiAnchorOptions();
  const key=$('#poiAnchor').value,gps=NAV.position||st.me,mapCenter=map.getCenter();
  if(key==='gps'&&gps)return{point:gps,name:t('poiAnchorGps'),usingGps:true};
  if(key==='pickup'&&st.origin)return{point:st.origin,name:t('poiAnchorPickup'),usingGps:false};
  if(key.startsWith('drop:')){
    const index=Number(key.slice(5)),stop=st.stops[index];
    if(stop)return{point:stop,name:stop.name||t('poiAnchorDropoff',{n:index+1}),usingGps:false}
  }
  if(key==='map')return{point:{lat:mapCenter.lat,lng:mapCenter.lng},name:t('poiAnchorMap'),usingGps:false};
  if(gps)return{point:gps,name:t('poiAnchorGps'),usingGps:true};
  if(st.origin)return{point:st.origin,name:t('poiAnchorPickup'),usingGps:false};
  if(st.stops.length)return{point:st.stops[st.stops.length-1],name:st.stops[st.stops.length-1].name||t('poiAnchorDropoff',{n:st.stops.length}),usingGps:false};
  return{point:{lat:mapCenter.lat,lng:mapCenter.lng},name:t('poiAnchorMap'),usingGps:false}
}
function activePoiVehicle(category){
  const config=PLACE_CATEGORY_BY_ID[category],selected=vById(st.sel.land)||st.chosen?.land?.v,
    vehicle=selected?.dom==='land'?selected:null;
  return vehicle||config.vehicles.map(vById).find(Boolean)||vById('car')
}
function poiIndication(place,category){
  const config=PLACE_CATEGORY_BY_ID[category],vehicle=activePoiVehicle(category),suggested=config.vehicles.map(vById).find(Boolean)||vehicle,
    rate=Number(st.fuel?.[vehicle.fuel]),detourKm=place.km*2,
    kmFuel=vehicle.dom==='water'?vehicle.fuelLph/vehicle.speed:1/vehicle.kmpl,
    routeFactor=Number(st.r?.factor),traffic=Number.isFinite(routeFactor)?1+.35*Math.max(0,routeFactor-1):1,
    fuelCost=Number.isFinite(rate)?detourKm*kmFuel*rate*traffic:null,
    minutes=detourKm/Math.max(1,vehicle.speed)*60;
  return{detourKm,fuelCost,minutes,vehicle,suggested}
}
function poiDistance(km){
  return km<1?t('poiMeters',{n:Math.round(km*1000)}):t('poiKm',{n:km.toFixed(1)})
}
function renderMapCategories(){
  const bar=$('#mapCategoryBar');if(!bar)return;
  bar.replaceChildren(...PLACE_CATEGORIES.map(group=>{
    const section=document.createElement('div'),title=document.createElement('span');
    section.className='map-category-group';section.setAttribute('role','group');section.setAttribute('aria-label',t(group.k));
    title.className='map-category-group-title';title.textContent=t(group.k);
    section.append(title,...group.categories.map(mapCategoryButton));return section
  }));
  bar.setAttribute('aria-label',t('poiExplore'));
  $('#poiAnchorLabel').textContent=t('poiAnchorLabel');$('#poiRadiusLabel').textContent=t('poiRadiusLabel');$('#poiSortLabel').textContent=t('poiSortLabel');
  for(const [id,key] of [['poiRadius1','poiRadius1'],['poiRadius3','poiRadius3'],['poiRadius5','poiRadius5'],
    ['poiSortDistance','poiSortDistance'],['poiSortCost','poiSortCost'],['poiSortEta','poiSortEta']])$('#'+id).textContent=t(key);
  $('#poiAnchor').setAttribute('aria-label',t('poiAnchorLabel'));$('#poiRadius').setAttribute('aria-label',t('poiRadiusLabel'));$('#poiSort').setAttribute('aria-label',t('poiSortLabel'));
  $('#poiClose').setAttribute('aria-label',t('poiClose'));
  updatePoiAnchorOptions();updateMapCategoryState()
}
function updateMapCategoryState(){
  $$('#mapCategoryBar [data-poi-cat]').forEach(button=>{
    const active=button.dataset.poiCat===activeMapCategory;
    button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))
  })
}
// Reuse app.js addPoint() so planner stop updates immediately run the route recalculation.
function addPlaceToPlan(place,action){
  const hasPickup=!!st.origin;
  if(action==='pickup'){addPoint(place.lat,place.lng,place.name,true);toast(t('poiPickupAdded'),'ok');return}
  if(action==='support')addPoint(place.lat,place.lng,place.name,false,'support');
  else addPoint(place.lat,place.lng,place.name,false);
  toast(hasPickup?t(action==='support'?'poiSupportAdded':'poiDropAdded'):'poiAsPickupNoOrigin','ok')
}
function showMapPlaces(result,category){
  const panel=$('#poiPanel'),list=$('#poiResults'),config=PLACE_CATEGORY_BY_ID[category];
  panel.hidden=false;$('#poiHeading').textContent=t(config.k);
  $('#poiSummary').textContent=t('poiSearchSummary',{n:result.places.length,radius:result.radiusKm,anchor:result.anchorLabel});
  list.replaceChildren();if(mapPoiLayer)mapPoiLayer.clearLayers();
  const nativeMarkers=[];
  if(!result.places.length){
    planner3D?.setMarkers('poi',[]);
    const empty=document.createElement('p');empty.className='muted';empty.textContent=t('poiNoResults');list.append(empty);return
  }
  // Keep the category markers separate from app.js route markers on the shared Leaflet map.
  if(!mapPoiLayer)mapPoiLayer=L.layerGroup().addTo(map);
  result.places.forEach((place,index)=>{
    const impact=place.impact,marker=L.marker(place,{icon:L.divIcon({className:'poi-icon-wrap',
      html:`<span class="poi-map-icon" style="--poi-color:${config.color};--poi-marker-ink:${config.markerInk||'#353839'}"><span class="poi-map-badge">${config.badge}</span><svg class="poi-marker-svg" aria-hidden="true"><use href="#${config.icon}"></use></svg></span>`,
      iconSize:[42,48],iconAnchor:[21,46]})}).addTo(mapPoiLayer);
    const markerHtml=`<span class="poi-map-icon" style="--poi-color:${config.color};--poi-marker-ink:${config.markerInk||'#353839'}"><span class="poi-map-badge">${config.badge}</span><svg class="poi-marker-svg" aria-hidden="true"><use href="#${config.icon}"></use></svg></span>`;
    nativeMarkers.push({
      id:place.id||index,lat:place.lat,lng:place.lng,html:markerHtml,className:'poi-icon-wrap',
      anchor:'bottom',label:place.name,popup:`${place.name} · ${poiDistance(place.km)} · ${t('poiFuelImpact',{cost:impact.fuelCost===null?'—':peso(impact.fuelCost)})}`
    });
    marker.bindPopup(`<strong>${esc(place.name)}</strong><br><span>${esc(poiDistance(place.km))}</span><br><span>${esc(t('poiFuelImpact',{cost:impact.fuelCost===null?'—':peso(impact.fuelCost)}))}</span>`);
    const row=document.createElement('article'),icon=document.createElement('span'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),
      use=document.createElementNS('http://www.w3.org/2000/svg','use'),details=document.createElement('div'),
      name=document.createElement('strong'),address=document.createElement('small'),badges=document.createElement('div'),actions=document.createElement('div');
    row.className='poi-result';row.setAttribute('role','listitem');row.style.setProperty('--poi-color',config.color);row.style.setProperty('--poi-marker-ink',config.markerInk||'#353839');
    icon.className='poi-result-icon';icon.textContent=config.badge;icon.title=t(config.k);
    svg.classList.add('i');svg.setAttribute('aria-hidden','true');use.setAttribute('href','#'+config.icon);svg.append(use);icon.append(svg);
    details.className='poi-result-details';name.className='poi-result-name';name.textContent=place.name;
    address.className='poi-result-detail';address.textContent=[poiDistance(place.km),place.info].filter(Boolean).join(' · ');
    badges.className='poi-indications';
    const indicationItems=[
      ['distance',poiDistance(place.km)],
      ['detour',t('poiDetour',{km:impact.detourKm.toFixed(1)})],
      ['fuel',t('poiFuelImpact',{cost:impact.fuelCost===null?'—':peso(impact.fuelCost)})],
      ['eta',t('poiEtaImpact',{time:fmtT(impact.minutes)})],
      ['vehicle',t('poiVehicleHint',{vehicle:impact.suggested.name})]
    ];
    indicationItems.forEach(([kind,text])=>{const pill=document.createElement('span');pill.className='poi-pill poi-pill-'+kind; pill.textContent = text; badges.append(pill)});
    details.append(name,address,badges);actions.className='poi-result-actions';
    for(const [action,key] of [['pickup','poiPickupAction'],['drop','poiDropAction'],['support','poiSupportAction']]){
      const button=document.createElement('button');button.type='button';button.className='btn poi-action poi-action-'+action;button.textContent=t(key);
      button.setAttribute('aria-label',t('poiActionLabel',{action:t(key),place:place.name}));
      button.onclick=()=>addPlaceToPlan(place,action);actions.append(button)
    }
    row.append(icon,details,actions);list.append(row)
  });
  planner3D?.setMarkers('poi',nativeMarkers);
  const bounds=[result.at,...result.places];
  if(planner3D?.visible)planner3D.fitPoints(bounds);
  else map.fitBounds(L.latLngBounds(bounds.map(place=>[place.lat,place.lng])),{padding:[30,30],maxZoom:15})
}
async function searchMapCategory(category){
  if(!PLACE_CATEGORY_BY_ID[category])return;
  const request=++mapPoiRequest,radiusKm=Number($('#poiRadius').value)||3,sortBy=$('#poiSort').value;
  clearPoiSearchPulse();
  activeMapCategory=category;updateMapCategoryState();
  const panel=$('#poiPanel');panel.hidden=false;panel.setAttribute('aria-busy','true');
  $('#poiHeading').textContent=t(PLACE_CATEGORY_BY_ID[category].k);$('#poiSummary').textContent=t('poiSearching');
  $('#poiResults').replaceChildren();
  if(mapPoiLayer)mapPoiLayer.clearLayers();planner3D?.setMarkers('poi',[]);
  $$('#mapCategoryBar [data-poi-cat]').forEach(button=>button.disabled=true);
  try{
    if($('#poiAnchor').value==='gps'&&!NAV.position&&!st.me){
      $('#poiSummary').textContent=t('poiLocating');
      const current=await requestCurrentLocation({recenter:true});
      if(request!==mapPoiRequest)return;
      if(!current){$('#poiSummary').textContent=t('poiGpsRequired');return}
      updatePoiAnchorOptions();$('#poiAnchor').value='gps'
    }
    const anchor=poiAnchor();
    showPoiSearchPulse(anchor.point);
    const result=await findPlaces(category,null,100,{at:anchor.point,radius:radiusKm*1000,radiusKm,maxResults:240});
    if(request===mapPoiRequest){
      const places=result.places.map(place=>({...place,km:hav(anchor.point,place)}))
        .filter(place=>place.categoryId===category&&place.km<=radiusKm)
        .map(place=>({...place,impact:poiIndication(place,category)}));
      places.sort((a,b)=>sortBy==='cost'?(a.impact.fuelCost??Infinity)-(b.impact.fuelCost??Infinity):
        sortBy==='eta'?a.impact.minutes-b.impact.minutes:a.km-b.km);
      lastMapPoiResult={...result,at:anchor.point,radiusKm,anchorLabel:anchor.name,usingGps:anchor.usingGps,places};
      showMapPlaces(lastMapPoiResult,category)
    }
  }catch(error){
    console.warn('Nearby place search failed.',error);
    if(request===mapPoiRequest){
      $('#poiSummary').textContent=t('poiSearchFailed');$('#poiResults').replaceChildren();
      if(mapPoiLayer)mapPoiLayer.clearLayers();planner3D?.setMarkers('poi',[])
    }
  }finally{
    if(request===mapPoiRequest){
      clearPoiSearchPulse();
      panel.setAttribute('aria-busy','false');
      $$('#mapCategoryBar [data-poi-cat]').forEach(button=>button.disabled=false)
    }
  }
}
$('#poiAnchor').addEventListener('change',()=>{if(activeMapCategory)searchMapCategory(activeMapCategory)});
$('#poiRadius').addEventListener('change',()=>{if(activeMapCategory)searchMapCategory(activeMapCategory)});
$('#poiSort').addEventListener('change',()=>{if(activeMapCategory)searchMapCategory(activeMapCategory)});
$('#poiClose').onclick=()=>{
  mapPoiRequest++;lastMapPoiResult=null;
  clearPoiSearchPulse();
  $('#poiPanel').hidden=true;$('#poiPanel').removeAttribute('aria-busy');
  $$('#mapCategoryBar [data-poi-cat]').forEach(button=>button.disabled=false);
  activeMapCategory='';updateMapCategoryState();if(mapPoiLayer)mapPoiLayer.clearLayers();planner3D?.setMarkers('poi',[])
};
renderMapCategories();
