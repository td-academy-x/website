/* ═══ TD Academy — Dashboard Core ═══ */

const ROLES = {
  super_admin: {
    label: 'مدير عام',
    color: 'purple',
    level: 4,
    can: {
      manage_users: true,
      delete_users: true,
      change_roles: true,
      view_users: true,
      delete_any_post: true,
      delete_admin_post: true,
      pin_post: true,
      announce: true,
      write_post: true,
      comment: true,
      like: true,
      read_community: true,
      access_platform: true,
      edit_profile: true
    }
  },
  admin: {
    label: 'مشرف',
    color: 'blue',
    level: 3,
    can: {
      manage_users: false,
      delete_users: false,
      change_roles: false,
      view_users: true,
      delete_any_post: true,
      delete_admin_post: false,
      pin_post: true,
      announce: true,
      write_post: true,
      comment: true,
      like: true,
      read_community: true,
      access_platform: true,
      edit_profile: true
    }
  },
  subscriber: {
    label: 'مشترك',
    color: 'green',
    level: 2,
    can: {
      manage_users: false,
      delete_users: false,
      change_roles: false,
      view_users: false,
      delete_any_post: false,
      delete_admin_post: false,
      pin_post: false,
      announce: false,
      write_post: true,
      comment: true,
      like: true,
      read_community: true,
      access_platform: true,
      edit_profile: true
    }
  },
  free: {
    label: 'زائر',
    color: 'gray',
    level: 1,
    can: {
      manage_users: false,
      delete_users: false,
      change_roles: false,
      view_users: false,
      delete_any_post: false,
      delete_admin_post: false,
      pin_post: false,
      announce: false,
      write_post: false,
      comment: false,
      like: false,
      read_community: true,
      access_platform: false,
      edit_profile: true
    }
  }
};

const ROLES_AR = {
  super_admin: 'مدير عام',
  admin: 'مشرف',
  subscriber: 'مشترك',
  free: 'زائر'
};

/* ─── Auth ─── */
function requireAuth(){
  const u = localStorage.getItem('td_current_user');
  if(!u){ window.location.href='login.html'; return null; }
  return JSON.parse(u);
}

function refreshUser(user){
  const users = getUsers();
  const fresh = users.find(u=>u.id===user.id);
  if(fresh){
    localStorage.setItem('td_current_user',JSON.stringify(fresh));
    return fresh;
  }
  return user;
}

function logout(){
  localStorage.removeItem('td_current_user');
  window.location.href='login.html';
}

function can(user, permission){
  const role = ROLES[user.role];
  return role && role.can[permission];
}

function canDeletePost(currentUser, post){
  if(post.authorId === currentUser.id) return true;
  const role = ROLES[currentUser.role];
  if(!role) return false;
  if(role.can.delete_any_post){
    const authorUsers = getUsers();
    const author = authorUsers.find(u=>u.id===post.authorId);
    if(author && (author.role==='super_admin' || author.role==='admin') && !role.can.delete_admin_post){
      return false;
    }
    return true;
  }
  return false;
}

function canChangeRole(currentUser, targetUser, newRole){
  if(currentUser.role !== 'super_admin') return false;
  if(targetUser.id === currentUser.id) return false;
  return true;
}

/* ─── Storage helpers ─── */
function getUsers(){
  return JSON.parse(localStorage.getItem('td_users')||'[]');
}
function saveUsers(users){
  localStorage.setItem('td_users',JSON.stringify(users));
}
function getPosts(){
  return JSON.parse(localStorage.getItem('td_posts')||'[]');
}
function savePosts(posts){
  localStorage.setItem('td_posts',JSON.stringify(posts));
}

/* ─── Notifications ─── */
function getNotifications(){
  return JSON.parse(localStorage.getItem('td_notifications')||'[]');
}
function saveNotifications(notifs){
  localStorage.setItem('td_notifications',JSON.stringify(notifs));
}
function addNotification(notification){
  var notifs = getNotifications();
  notification.id = 'n' + Date.now() + Math.random().toString(36).substr(2,4);
  notification.date = new Date().toISOString();
  notification.read = false;
  notifs.unshift(notification);
  if(notifs.length > 100) notifs = notifs.slice(0, 100);
  saveNotifications(notifs);
}
function notifyAdmins(notification){
  addNotification(Object.assign({}, notification, {target: 'admin'}));
}
function notifyUser(userId, notification){
  addNotification(Object.assign({}, notification, {targetUserId: userId}));
}
function getMyNotifications(userId, role){
  var notifs = getNotifications();
  return notifs.filter(function(n){
    if(n.target === 'admin' && (role === 'super_admin' || role === 'admin')) return true;
    if(n.targetUserId === userId) return true;
    if(n.target === 'all') return true;
    return false;
  });
}
function getUnreadCount(userId, role){
  return getMyNotifications(userId, role).filter(function(n){ return !n.read; }).length;
}

/* ─── Profanity Filter ─── */
var PROFANITY_LIST = [
  'كلب','حمار','غبي','أحمق','حقير','وسخ','قذر','زبالة','منيوك','شرموط',
  'عرص','كس','طيز','زب','نيك','لعن','ابن ال','يلعن','متخلف','حيوان',
  'خول','ديوث','فاجر','لوطي','ملعون','واطي','قحبة','عاهرة','فاسق'
];
var POLITICAL_RELIGIOUS_TERMS = [
  'سني','شيعي','علوي','درزي','مسيحي','يهودي','ملحد','كافر',
  'حزب','انتخابات','طائفي','مذهب','بشار','إسرائيل','صهيوني',
  'داعش','إخوان','سلفي','ثورة','نظام','معارضة','عنصري','عرقي'
];

function checkContent(text){
  if(!text) return {ok:true};
  var lower = text.toLowerCase().trim();
  for(var i=0;i<PROFANITY_LIST.length;i++){
    if(lower.indexOf(PROFANITY_LIST[i])!==-1){
      return {ok:false, reason:'profanity', word:PROFANITY_LIST[i]};
    }
  }
  for(var j=0;j<POLITICAL_RELIGIOUS_TERMS.length;j++){
    if(lower.indexOf(POLITICAL_RELIGIOUS_TERMS[j])!==-1){
      return {ok:false, reason:'policy', word:POLITICAL_RELIGIOUS_TERMS[j]};
    }
  }
  return {ok:true};
}

function sendEmailPlaceholder(to, subject, body){
  console.log('[EMAIL PLACEHOLDER] To:', to, '| Subject:', subject, '| Body:', body);
}

/* ─── Pending Articles ─── */
function getPendingArticles(){
  return JSON.parse(localStorage.getItem('td_pending_articles')||'[]');
}
function savePendingArticles(articles){
  localStorage.setItem('td_pending_articles',JSON.stringify(articles));
}

/* ─── Avatar helper ─── */
function avatarSrc(user){
  if(user.avatar) return user.avatar;
  const letter = user.name ? user.name[0] : '?';
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%230A1628' width='100' height='100' rx='20'/%3E%3Ctext x='50' y='62' text-anchor='middle' fill='white' font-size='40' font-family='Arial'%3E"+encodeURIComponent(letter)+"%3C/text%3E%3C/svg%3E";
}

/* ─── Sidebar init ─── */
function initSidebar(user){
  const el = id => document.getElementById(id);
  if(el('sidebar-name')) el('sidebar-name').textContent = user.name;
  if(el('sidebar-role')) el('sidebar-role').textContent = ROLES_AR[user.role];
  if(el('sidebar-avatar')) el('sidebar-avatar').src = avatarSrc(user);

  if(user.role==='super_admin'||user.role==='admin'){
    if(el('admin-section')) el('admin-section').style.display='block';
    if(el('admin-link')) el('admin-link').style.display='flex';
  }

  if(user.role!=='free'){
    if(el('write-article-link')) el('write-article-link').style.display='flex';
  }
}

function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
}

/* ─── Toast ─── */
function showToast(msg,type){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.className='toast show '+(type||'');
  setTimeout(()=>t.className='toast',3000);
}

/* ─── Time formatting ─── */
function timeAgo(timestamp){
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff/60000);
  if(mins<1) return 'الآن';
  if(mins<60) return 'منذ '+mins+' دقيقة';
  const hrs = Math.floor(mins/60);
  if(hrs<24) return 'منذ '+hrs+' ساعة';
  const days = Math.floor(hrs/24);
  if(days<30) return 'منذ '+days+' يوم';
  return new Date(timestamp).toLocaleDateString('ar-EG');
}

/* ─── Notification Bell (shared) ─── */
function initNotifBell(){
  var u = JSON.parse(localStorage.getItem('td_current_user')||'null');
  if(!u) return;
  var badge = document.getElementById('notif-badge');
  var listEl = document.getElementById('notif-list');
  if(!badge || !listEl) return;
  var notifs = getMyNotifications(u.id, u.role);
  var unread = notifs.filter(function(n){return !n.read;}).length;
  if(unread > 0){badge.textContent = unread > 9 ? '9+' : unread;badge.style.display='flex';}
  else{badge.style.display='none';}
  if(notifs.length===0){listEl.innerHTML='<div class="notif-empty">لا توجد إشعارات</div>';return;}
  function _esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
  listEl.innerHTML = notifs.slice(0,20).map(function(n){
    return '<div class="notif-item'+(n.read?'':' unread')+'" onclick="clickNotif(\''+n.id+'\')">'+
      '<div class="notif-item-msg">'+_esc(n.message)+'</div>'+
      '<div class="notif-item-time">'+timeAgo(new Date(n.date).getTime())+'</div></div>';
  }).join('');
}
function toggleNotifDropdown(){
  var dd = document.getElementById('notif-dropdown');
  if(dd) dd.classList.toggle('show');
}
function clickNotif(id){
  var notifs = getNotifications();
  var idx = notifs.findIndex(function(n){return n.id===id;});
  if(idx!==-1){notifs[idx].read=true;saveNotifications(notifs);initNotifBell();}
  var dd = document.getElementById('notif-dropdown');
  if(dd) dd.classList.remove('show');
}
function markAllNotifRead(){
  var notifs = getNotifications();
  notifs.forEach(function(n){n.read=true;});
  saveNotifications(notifs);
  initNotifBell();
  showToast('تم تعيين جميع الإشعارات كمقروءة','success');
}

/* ─── Seed data ─── */
function seedIfEmpty(){
  let users = getUsers();
  if(users.length<=1){
    users = [
      {id:'1',name:'د. حسين طاحون',email:'admin@tdacademy.net',password:'admin123',role:'super_admin',avatar:'../../dr-hussein.jpg',joinDate:'1 يناير 2026',bio:'مؤسس TD Academy — جرّاح ومتداول'},
      {id:'2',name:'إبراهيم',email:'ibrahim@demo.com',password:'demo1234',role:'subscriber',avatar:'',joinDate:'15 مارس 2026',bio:'متداول مصري — بتعلّم من الصفر'},
      {id:'3',name:'أحمد',email:'ahmed@demo.com',password:'demo1234',role:'subscriber',avatar:'',joinDate:'20 فبراير 2026',bio:'مهندس برمجيات ومتداول'},
      {id:'4',name:'د. عمار',email:'ammar@demo.com',password:'demo1234',role:'subscriber',avatar:'',joinDate:'10 يناير 2026',bio:'طبيب ومتداول سوري'},
      {id:'5',name:'زيدون',email:'zaidoun@demo.com',password:'demo1234',role:'subscriber',avatar:'',joinDate:'5 أبريل 2026',bio:'متداول سوري — مهتم بالتحليل الفني'}
    ];
    saveUsers(users);
  }

  let posts = getPosts();
  if(posts.length===0){
    var now = Date.now();
    posts = [
      {
        id:'p1',authorId:'1',
        content:'أهلاً وسهلاً بكم في مجتمع TD Academy!\n\nهذا المكان مخصص للتواصل بينكم كمتدربين — شاركوا تحليلاتكم، اطرحوا أسئلتكم، واستفيدوا من بعضكم.\n\nقواعد بسيطة:\n• احترام متبادل\n• لا توصيات شراء أو بيع\n• شاركوا لتتعلموا',
        timestamp: now-604800000,
        likes:['2','3','4','5'],
        comments:[
          {id:'c1',authorId:'2',text:'والله منتظرين المجتمع ده من زمان! شكراً يا دكتور',timestamp:now-604000000},
          {id:'c2',authorId:'4',text:'يعطيك العافية دكتور حسين، المجتمع رح يكون إضافة كبيرة للأكاديمية',timestamp:now-603000000},
          {id:'c3',authorId:'1',text:'أهلاً فيكم جميعاً — هذا المكان لكم، استفيدوا منه',timestamp:now-602000000}
        ],
        pinned:true,
        announcement:true,
        image:null,
        videoUrl:null
      },
      {
        id:'p2',authorId:'2',
        content:'يا جماعة النهاردة كنت بحلّل سهم AAPL وشفت نمط كوب وعروة واضح جداً على الشارت اليومي. السهم لسه عند مستوى الدعم 182$ والمتوسط المتحرك 50 شايله من تحت.\n\nالحمد لله الموسم التالت خلّاني أشوف الحاجات دي اللي كنت مستحيل ألاحظها قبل كده.',
        timestamp: now-432000000,
        likes:['1','3','4','5'],
        comments:[
          {id:'c4',authorId:'3',text:'تحليل ممتاز يا إبراهيم! أنا كمان شايف نفس الباترن. بس خلّي بالك من الأرباح الربع سنوية الأسبوع الجاي',timestamp:now-430000000},
          {id:'c5',authorId:'4',text:'برافو عليك يا إبراهيم، التحليل واضح ومرتّب. هيك بدنا!',timestamp:now-428000000},
          {id:'c6',authorId:'2',text:'شكراً يا أحمد، فعلاً الأرباح ممكن تأثّر. هخلّي بالي',timestamp:now-426000000},
          {id:'c7',authorId:'5',text:'الله يعطيك العافية، أنا كمان شايف إنو الفوليوم عم بيزيد وهاد إشارة منيحة',timestamp:now-424000000}
        ],
        pinned:false,
        announcement:false,
        image:'/site/blog/img-technical-analysis.jpg',
        videoUrl:null
      },
      {
        id:'p3',authorId:'3',
        content:'خلّصت الموسم الرابع إمبارح والحقيقة التحليل الأساسي غيّر نظرتي تماماً. كنت فاكر إن الأرقام المالية حاجة مملة بس لما فهمت إزاي أقرأ قائمة الدخل وأقارن نسب الربحية بين الشركات حسّيت إن عندي سلاح جديد.\n\nنصيحتي لأي حد لسه في المواسم الأولى: ما تستعجلوش، كل موسم بيبني على اللي قبله.',
        timestamp: now-345600000,
        likes:['1','2','4'],
        comments:[
          {id:'c8',authorId:'1',text:'كلام جميل يا أحمد، وده بالظبط الفكرة — التدرّج هو الأساس. أهنيك على إتمام الموسم الرابع',timestamp:now-344000000},
          {id:'c9',authorId:'5',text:'مشان الله لا تستعجلوا، أنا غلطت بالأول وقفزت موسمين وبعدين رجعت من الأول. التدرج فعلاً مهم',timestamp:now-340000000},
          {id:'c10',authorId:'2',text:'أنا لسه في التالت بس كلامك خلّاني أستنى الرابع بفارغ الصبر!',timestamp:now-338000000}
        ],
        pinned:false,
        announcement:false,
        image:'/site/blog/img-stock-market.jpg',
        videoUrl:null
      },
      {
        id:'p4',authorId:'4',
        content:'يا شباب، حابب شارككم تجربتي بالتداول النفسي. أنا طبيب وبعرف شو يعني الضغط النفسي، بس والله التداول شي تاني.\n\nأول ما بلّشت كنت كل ما أدخل صفقة وتنزل شوي بحس قلبي رح يوقف. الموسم السابع علّمني إنو الخسارة جزء من اللعبة والمهم إدارة المخاطر مش تجنّبها.\n\nهلق صرت أحط ستوب لوس وبنام مرتاح.',
        timestamp: now-259200000,
        likes:['1','2','3','5'],
        comments:[
          {id:'c11',authorId:'3',text:'كلامك ده مهم جداً يا دكتور عمار. أنا كمان كنت بعاني من نفس المشكلة. الخوف من الخسارة أصعب من الخسارة نفسها',timestamp:now-258000000},
          {id:'c12',authorId:'2',text:'والله كلام من دهب! أنا لسه بتعلّم أتحكّم في مشاعري وقت التداول. ربنا يوفقك يا دكتور',timestamp:now-256000000},
          {id:'c13',authorId:'4',text:'شكراً يا شباب، المهم نتعلّم من بعض. كلنا بنمر بنفس المراحل',timestamp:now-254000000},
          {id:'c14',authorId:'1',text:'كلام دقيق يا د. عمار — وهذا بالضبط لماذا خصصنا موسماً كاملاً لعلم نفس التداول. الانضباط النفسي مهارة وليس موهبة',timestamp:now-252000000},
          {id:'c15',authorId:'5',text:'أنا كمان دكتور عمار مريت بنفس الشي! هلق بعد الموسم السابع صرت أتعامل مع الخسارة بشكل مختلف تماماً',timestamp:now-250000000}
        ],
        pinned:false,
        announcement:false,
        image:'/site/blog/img-trading-psychology.jpg',
        videoUrl:null
      },
      {
        id:'p5',authorId:'5',
        content:'مرحبا يا جماعة، اليوم عملت أول تحليل فني كامل بحياتي على سهم NVDA. استخدمت المتوسطات المتحركة 20 و50 وشفت تقاطع ذهبي صاير.\n\nبعرف إنو التحليل بسيط بس بالنسبة لشخص كان ما بيعرف شو يعني شارت قبل 3 أشهر، هالشي كتير كبير بالنسبة إلي.\n\nشكراً د. حسين طاحون على المنهج اللي خلّاني أوصل لهون.',
        timestamp: now-172800000,
        likes:['1','2','3','4'],
        comments:[
          {id:'c16',authorId:'1',text:'ما شاء الله يا زيدون، تحليل ممتاز لشخص بدأ من 3 أشهر فقط. استمر بنفس الوتيرة',timestamp:now-170000000},
          {id:'c17',authorId:'3',text:'برافو عليك يا زيدون! أنا فاكر أول تحليل عملته كنت فرحان زيّك بالظبط. ده بس البداية!',timestamp:now-168000000},
          {id:'c18',authorId:'4',text:'هيك منحكي! خطوة خطوة. التقاطع الذهبي إشارة مهمة بس تأكد إنو الفوليوم كمان عم بيدعم الحركة',timestamp:now-166000000},
          {id:'c19',authorId:'5',text:'شكراً كتير يا جماعة، تعليقاتكم بتحفّزني أكمّل. ود. عمار فعلاً رح راقب الفوليوم',timestamp:now-164000000}
        ],
        pinned:false,
        announcement:false,
        image:'/site/blog/img-technical-analysis.jpg',
        videoUrl:null
      },
      {
        id:'p6',authorId:'2',
        content:'سؤال للمجتمع: مين فيكم جرّب يتداول في وقت إعلان الأرباح؟ أنا كنت بفكّر أدخل على MSFT قبل الأرباح بس مش عارف لو ده قرار حكيم ولا لأ.\n\nاللي عنده خبرة في الموضوع يفيدنا.',
        timestamp: now-86400000,
        likes:['3','5'],
        comments:[
          {id:'c20',authorId:'4',text:'يا إبراهيم، التداول وقت الأرباح فيو مخاطرة عالية. السهم ممكن يروح لفوق أو لتحت بشكل كبير. أنا شخصياً بفضّل أستنى بعد الإعلان وأشوف ردة فعل السوق',timestamp:now-84000000},
          {id:'c21',authorId:'3',text:'أنا موافق مع د. عمار. الموسم الخامس بيشرح الموضوع ده بالتفصيل. الأفضل تستنى وتدخل بعد ما تشوف رد فعل السوق على الأرقام',timestamp:now-82000000},
          {id:'c22',authorId:'1',text:'نصيحة مهمة: لا تدخل صفقة قبل الأرباح إلا إذا كنت مستعداً لأن تخسر كل ما استثمرته فيها. الأرباح حدث غير متوقع بطبيعته',timestamp:now-80000000},
          {id:'c23',authorId:'2',text:'شكراً يا جماعة على النصايح! قررت أستنى بعد الإعلان. الحمد لله المجتمع ده بينقذني من قرارات متسرّعة',timestamp:now-78000000},
          {id:'c24',authorId:'5',text:'سؤال منيح يا إبراهيم، أنا كمان كنت بفكر بنفس الشي. هلق عرفت إنو الأفضل نستنى',timestamp:now-76000000}
        ],
        pinned:false,
        announcement:false,
        image:null,
        videoUrl:null
      }
    ];
    savePosts(posts);
  }
}
seedIfEmpty();
