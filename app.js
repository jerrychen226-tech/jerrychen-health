const PASSWORD='8261';
const KB=window.__KB__||{}, IOS=window.__IOS__||{}, NUT=window.__NUTRITION__||[], AS=window.__ASSESS__||{};
const PHOTO_KEY='hd_photo_logs';
let currentPhotoData=null;
function tryLogin(){
  if(document.getElementById('pwdInput').value===PASSWORD||localStorage.getItem('hd_auth')==='1'){
    localStorage.setItem('hd_auth','1');
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('lastUpdate').textContent=new Date().toLocaleString('zh-TW');
    boot();
  } else alert('通行碼錯誤');
}
function logout(){localStorage.removeItem('hd_auth');location.reload()}
if(localStorage.getItem('hd_auth')==='1'){
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  window.addEventListener('load',()=>{document.getElementById('lastUpdate').textContent=new Date().toLocaleString('zh-TW');boot()});
}
function showSection(name){
  ['dashboard','photo','assess','exercise','nutrition','labs'].forEach(s=>{
    const el=document.getElementById('section-'+s); if(el) el.classList.toggle('hidden',s!==name);
    const b=document.getElementById('btn-'+s); if(b) b.classList.toggle('nav-active',s===name);
  });
}
function statusClass(s){
  if(['達標','穩定','改善中'].includes(s)) return 'good';
  if(['待追蹤','觀察','追蹤'].includes(s)) return 'warn';
  return 'bad';
}
function onPhotoSelected(e){
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=()=>{currentPhotoData=reader.result; const img=document.getElementById('photoPreview'); if(img){img.src=currentPhotoData; document.getElementById('photoPreviewWrap').classList.remove('hidden');}};
  reader.readAsDataURL(f);
}
function getPhotoLogs(){try{return JSON.parse(localStorage.getItem(PHOTO_KEY)||'[]')}catch(e){return []}}
function saveFoodLog(){
  const name=(document.getElementById('foodName').value||'').trim();
  if(!name){alert('請填寫食物名稱');return}
  const logs=getPhotoLogs();
  logs.unshift({id:Date.now(),time:document.getElementById('foodTime').value||new Date().toISOString(),name,style:document.getElementById('foodStyle').value,kcal:parseFloat(document.getElementById('foodKcal').value)||0,carb:parseFloat(document.getElementById('foodCarb').value)||0,protein:parseFloat(document.getElementById('foodPro').value)||0,fat:parseFloat(document.getElementById('foodFat').value)||0,photo:currentPhotoData||null});
  localStorage.setItem(PHOTO_KEY,JSON.stringify(logs.slice(0,80)));
  alert('已儲存');
  renderPhotoLogs();
}
function renderPhotoLogs(){
  const box=document.getElementById('photoLogList'); if(!box) return;
  const logs=getPhotoLogs();
  box.innerHTML=logs.length?logs.map(l=>'<div class="card rounded-xl p-4 mb-2"><p class="font-medium">'+l.name+'</p><p class="text-sm">'+l.kcal+' kcal</p></div>').join(''):'<p class="text-slate-500 text-sm">尚無紀錄</p>';
}
function boot(){
  if(IOS.weight) document.getElementById('kpi-weight').textContent=IOS.weight;
  if(IOS.bodyfat) document.getElementById('kpi-bf').textContent=IOS.bodyfat+'%';
  if(IOS.glucoseLatest) document.getElementById('kpi-glucose').textContent=IOS.glucoseLatest;
  if(AS.summary){
    const s1=document.getElementById('assess-summary'); if(s1) s1.textContent=AS.summary;
    const s2=document.getElementById('assess-full-summary'); if(s2) s2.textContent=AS.summary;
  }
  const box=document.getElementById('assess-items');
  if(box&&AS.items) box.innerHTML=AS.items.map(it=>'<div class="card rounded-xl p-4"><div class="flex justify-between"><span>'+it.topic+'</span><span class="text-xs '+statusClass(it.status)+'">'+it.status+'</span></div><p class="text-sm text-slate-400 mt-1">'+it.detail+'</p></div>').join('');
  const al=document.getElementById('assess-actions');
  if(al&&AS.actions) al.innerHTML=AS.actions.map(a=>'<li>'+a+'</li>').join('');
  if(AS.refs){const r=document.getElementById('assess-refs'); if(r) r.textContent=AS.refs}
  renderPhotoLogs();
}
document.getElementById('pwdInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')tryLogin()});
