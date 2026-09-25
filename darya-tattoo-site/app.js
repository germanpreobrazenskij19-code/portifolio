const works = portfolioWorks;
const strip=document.querySelector('.work-strip'),photoDialog=document.querySelector('#photo-dialog'),infoDialog=document.querySelector('#info-dialog'),bookingDialog=document.querySelector('#booking-dialog');
let currentPhoto=0,photoIndices=[];
const activeIndices=()=>works.slice(0,5).map((_,index)=>index);
const wrap=(index,length)=>(index%length+length)%length;
function photoMarkup(index,fullSize=false){const work=works[index];return `<span class="work-image"><img src="${work.src}" alt="${work.title} — Darya" style="object-position:${work.position||'center'};transform:${work.transform||'none'}" loading="lazy" decoding="async"></span>`;}
function renderWorks(){
 const indices=activeIndices(),count=indices.length;
 strip.innerHTML=Array.from({length:count},(_,n)=>{const index=indices[n];return `<button class="work-card" data-work="${index}" aria-label="Открыть: ${works[index].title}">${photoMarkup(index)}</button>`}).join('');
 strip.setAttribute('aria-label','Татуировки — наши работы');
}
function openPhoto(index,indices=activeIndices()){
 photoIndices=indices;currentPhoto=index;
 document.querySelector('#photo-title').textContent=works[index].title;
 document.querySelector('#large-photo').innerHTML=photoMarkup(index,true);
 document.querySelector('#photo-count').textContent=`${String(indices.indexOf(index)+1).padStart(2,'0')} / ${String(indices.length).padStart(2,'0')}`;
 if(!photoDialog.open)photoDialog.showModal();
}
function shiftPhoto(delta){const indices=photoIndices;openPhoto(indices[wrap(indices.indexOf(currentPhoto)+delta,indices.length)],indices)}
strip.addEventListener('click',event=>{const card=event.target.closest('[data-work]');if(card)openPhoto(Number(card.dataset.work))});
document.querySelectorAll('[data-photo-shift]').forEach(button=>button.addEventListener('click',()=>shiftPhoto(Number(button.dataset.photoShift))));

photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();shiftPhoto(1)}if(event.key==='ArrowLeft'){event.preventDefault();shiftPhoto(-1)}});
document.querySelectorAll('dialog:not(#booking-dialog)').forEach(dialog=>{dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}})});
document.querySelector('[data-panel="photos"]').addEventListener('click',()=>{document.querySelector('#info-title').textContent='О фотографиях.';document.querySelector('#info-content').innerHTML='<p>На сайте использованы фотографии из публичного портфолио Darya. Цвет и кадрирование унифицированы для оформления сайта.</p><a class="text-link" href="https://t.me/s/darya_studio_tattoo" target="_blank" rel="noopener">Открыть портфолио Darya ↗</a>';infoDialog.showModal()});
const menuButton=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
renderWorks();

const piercingPreview=document.querySelector('#piercing-preview');
if(piercingPreview){
 const indices=works.flatMap((work,index)=>work.category==='piercing'?[index]:[]).slice(0,5);
 piercingPreview.innerHTML=indices.map(index=>`<button type="button" class="work-card" data-piercing-work="${index}" aria-label="Открыть: ${works[index].title}">${photoMarkup(index)}</button>`).join('');
 piercingPreview.addEventListener('click',event=>{const card=event.target.closest('[data-piercing-work]');if(card)openPhoto(Number(card.dataset.piercingWork),indices)});
}

const siteHeader=document.querySelector('.header');
const updateHeader=()=>siteHeader.classList.toggle('is-scrolled',window.scrollY>24);
window.addEventListener('scroll',updateHeader,{passive:true});
updateHeader();

// Load and play only the montage for the current viewport.
const studioVideo=document.querySelector('#studio-video');
if(studioVideo){
 const section=document.querySelector('#studio');
 const desktop=[...section.querySelectorAll('.studio-cut--desktop')];
 const mobile=section.querySelector('.studio-cut--mobile');
 const all=[...desktop,mobile];
 const narrow=matchMedia('(max-width:767px)');
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 const active=()=>narrow.matches?[mobile]:desktop;
 let visible=false,starting=false;
 const pause=()=>all.forEach(v=>v.pause());
 const sync=()=>{
  const clips=active();
  all.filter(v=>!clips.includes(v)).forEach(v=>v.pause());
  section.querySelector('.studio-montage').setAttribute('aria-label',narrow.matches?'Видео работ Дарьи':'Видео работ Дарьи');
  if(!visible||document.hidden||motion.matches){pause();return}
  clips.forEach(v=>{v.muted=true;if(!v.getAttribute('src')){v.src=v.dataset.src;v.preload='auto';v.load()}});
  if(starting||clips.some(v=>v.readyState<3))return;
  starting=true;
  Promise.allSettled(clips.map(v=>v.play())).then(results=>{
   starting=false;
   const current=active();
   all.filter(v=>!current.includes(v)).forEach(v=>v.pause());
   if(clips[0]!==current[0]){sync();return}
   if(!visible||document.hidden||motion.matches||results.some(r=>r.status==='rejected'))pause();
  });
 };
 all.forEach(v=>v.addEventListener('canplay',sync));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.15}).observe(section);
 document.addEventListener('visibilitychange',sync);
 motion.addEventListener('change',sync);
 narrow.addEventListener('change',()=>{pause();sync()});
}
