// Hero arka plan videosu - kesintisiz otomatik oynatma
(function () {
  var v = document.querySelector(".hero__bg");
  if (!v) return;
  v.muted = true;
  v.setAttribute("muted", "");
  var tryPlay = function () {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  };
  tryPlay();
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) tryPlay();
  });
  ["click", "touchstart", "scroll"].forEach(function (ev) {
    window.addEventListener(ev, tryPlay, { once: true, passive: true });
  });
})();

// Teminat kart kaydırıcısı (03 - Teminatlar) — kesintisiz otomatik akış + menü senkronu
(function () {
  var track = document.getElementById("pcards");
  if (!track) return;

  var menuBtns = Array.prototype.slice.call(document.querySelectorAll("#pmenu .pmenu"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("#dots .dot"));
  var carousel = track.closest(".product__carousel");

  var originals = Array.prototype.slice.call(track.children);
  var total = originals.length;
  if (!total) return;

  // Sonsuz/pürüzsüz döngü için baştaki kartların kopyalarını sona ekle
  var clones = Math.min(3, total);
  for (var c = 0; c < clones; c++) {
    track.appendChild(originals[c].cloneNode(true));
  }

  var GAP = 22;
  var index = 0;
  var animating = false;

  function stepWidth() {
    var card = track.querySelector(".pcard");
    return card ? card.getBoundingClientRect().width + GAP : 0;
  }

  function move(i, animate) {
    track.style.transition = animate
      ? "transform .6s cubic-bezier(.22,.61,.36,1)"
      : "none";
    track.style.transform = "translateX(" + -stepWidth() * i + "px)";
  }

  function syncUI(real) {
    menuBtns.forEach(function (b, bi) {
      b.classList.toggle("is-active", bi === real);
    });
    dots.forEach(function (d, di) {
      d.classList.toggle("is-active", di === real);
    });
  }

  function go(target) {
    if (animating) return;
    animating = true;
    index = target;
    move(index, true);
    syncUI(((index % total) + total) % total);
  }

  track.addEventListener("transitionend", function () {
    animating = false;
    // Kopyalara ulaşıldıysa görünmeden başa sar
    if (index >= total) {
      index = index - total;
      move(index, false);
    } else if (index < 0) {
      index = index + total;
      move(index, false);
    }
  });

  // Sol menü: başlığa basınca o görsel öne/ortaya gelir
  menuBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = parseInt(btn.getAttribute("data-index"), 10) || 0;
      go(i);
      restart();
    });
  });
  dots.forEach(function (d, di) {
    d.addEventListener("click", function () {
      go(di);
      restart();
    });
  });

  // Otomatik, pürüzsüz akış
  var timer = null;
  function start() {
    timer = setInterval(function () { go(index + 1); }, 3800);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { stop(); start(); }

  if (carousel) {
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
  }
  window.addEventListener("resize", function () { move(index, false); });

  syncUI(0);
  move(0, false);
  start();
})();

// Müşteri yorumları carousel (04 - Referanslar)
(function () {
  var grid = document.getElementById("reviewsGrid");
  if (!grid) return;

  var data = [
    { n: "Mehmet K.", t: "Şarj Ağı İşletmecisi", s: 5, img: "assets/av-9f2a.jpg", q: "AVM otoparkındaki DC şarj ünitemizde yaşanan güç modülü arızasında süreç beklediğimizden hızlı ilerledi. Eksper yönlendirmesi ve hasar takibi konusunda düzenli bilgilendirme aldık." },
    { n: "Ahmet T.", t: "Filo Yönetimi Sorumlusu", s: 5, img: "assets/av-3b7c.jpg", q: "Elektrikli araç filomuz için kurduğumuz şarj altyapısını sigortalatırken detaylı risk analizi yaptılar. Kurumsal tarafta güven veren bir ekip." },
    { n: "Zeynep A.", t: "Kurumsal Satın Alma Uzmanı", s: 4, img: "assets/av-c41d.jpg", q: "İlk teklif sürecinde birkaç revizyon gerekti ancak sonrasında ihtiyacımıza uygun kapsam oluşturuldu. Özellikle elektronik cihaz teminatı bizim için önemliydi." },
    { n: "Elif K.", t: "İşletme Sahibi", s: 5, img: "assets/av-7e08.jpg", q: "İş yerimizdeki AC şarj istasyonları için danışmanlık aldık. Teknik detayları sade şekilde anlatmaları karar vermemizi kolaylaştırdı." },
    { n: "Buse Y.", t: "Elektrikli Araç Kullanıcısı", s: 5, img: "assets/av-1a55.jpg", q: "Ev tipi wallbox şarj ünitem için sigorta yaptırdım. Poliçe detayları açık ve anlaşılırdı. Kurulum sonrası destek de aldım." },
    { n: "Can D.", t: "Teknoloji Girişimcisi", s: 4, img: "assets/av-b6f3.jpg", q: "Şarj istasyonlarıyla ilgili risklerin bu kadar fazla olduğunu bilmiyordum. Süreç genel olarak iyiydi ancak evrak toplama kısmı biraz zaman aldı." },
    { n: "Murat K.", t: "Site Yönetim Danışmanı", s: 5, img: "assets/av-2d9e.jpg", q: "Ortak kullanım şarj alanlarımız için hazırlanan poliçe beklentilerimizi karşıladı. Özellikle sorumluluk teminatları konusunda detaylı bilgilendirme aldık." },
    { n: "Serkan A.", t: "Enerji Yatırımcısı", s: 5, img: "assets/av-84ca.jpg", q: "Yatırımını yaptığımız hızlı şarj istasyonları için uzun araştırmalar sonunda çalışmaya başladık. Hasar önleme tarafındaki yaklaşımları dikkat çekici." },
    { n: "Ayşe K.", t: "Kurumsal İletişim Yöneticisi", s: 4, img: "assets/av-5fb1.jpg", q: "Yenileme döneminde bazı kapsam değişiklikleri konusunda uzun görüşmeler yaptık. Sonunda ihtiyaçlarımıza uygun çözüm üretildi." },
    { n: "Hülya T.", t: "Operasyon Müdürü", s: 5, img: "assets/av-0c73.jpg", q: "Bir lokasyonumuzda yaşanan elektronik kart arızasında sürecin düzenli takip edilmesi güven verdi. Ekip oldukça ilgiliydi." },
    { n: "Tolga B.", t: "Apartman Yönetim Kurulu Üyesi", s: 4, img: "assets/av-e92f.jpg", q: "Ortak otoparkımıza kurulan şarj istasyonları için destek aldık. Başlangıçta kafamızda soru işaretleri vardı ancak tüm detaylar açıklandı." },
    { n: "Erhan K.", t: "Elektrik Mühendisi", s: 5, img: "assets/av-a3d8.jpg", q: "Risk mühendisliği yaklaşımını başarılı buldum. Sadece poliçe değil, önleyici bakım önerileri de sunmaları önemli bir avantaj." },
    { n: "İsmail D.", t: "Şarj Altyapı Kurulum Firması Yetkilisi", s: 5, img: "assets/av-6b40.jpg", q: "Müşterilerimize yönlendirebileceğimiz uzman bir ekip arıyorduk. Teknik bilgi seviyeleri oldukça yüksek." },
    { n: "Barış A.", t: "Elektrikli Araç Sahibi", s: 4, img: "assets/av-d1e7.jpg", q: "Ev şarj ünitem için teklif aldım. Süreç birkaç gün uzadı ancak sonrasında iletişim ve destek tarafı gayet iyiydi." },
    { n: "Gökhan K.", t: "Tesis Yönetim Danışmanı", s: 5, img: "assets/av-4f29.jpg", q: "Birden fazla lokasyondaki şarj istasyonlarımızı tek çatı altında güvence altına alabildik. Süreç profesyonel şekilde yönetildi." },
    { n: "Hasan T.", t: "İşletme Yöneticisi", s: 5, img: "assets/av-7c8b.jpg", q: "Şarj istasyonlarının sigorta tarafını ihmal etmemek gerektiğini bu süreçte daha iyi anladık. Memnun kaldığımız bir çalışma oldu." },
    { n: "Kemal A.", t: "Elektrikli Araç Şarj Noktası İşletmecisi", s: 4, img: "assets/av-39a6.jpg", q: "Hasar dosyamızın sonuçlanması beklediğimizden biraz uzun sürdü ancak süreç boyunca düzenli bilgilendirme yapıldı ve sonuç olumlu oldu." },
    { n: "Mustafa K.", t: "Enerji Sistemleri Danışmanı", s: 5, img: "assets/av-b5e2.jpg", q: "Şarj altyapısı yatırımlarında uzmanlaşmış bir ekip ile çalışmak fark yaratıyor. Teminat yapıları oldukça kapsamlı." }
  ];

  var review = grid.querySelector(".rcard--review");
  var mini = document.getElementById("rvMini");
  var avatar = document.getElementById("rvAvatar");
  var name = document.getElementById("rvName");
  var title = document.getElementById("rvTitle");
  var stars = document.getElementById("rvStars");
  var quote = document.getElementById("rvQuote");
  var miniName = document.getElementById("rvMiniName");
  var miniTitle = document.getElementById("rvMiniTitle");
  var miniAvatar = document.getElementById("rvMiniAvatar");
  var nextBtn = document.getElementById("rvNext");
  var total = data.length;
  var index = 0;
  var timer = null;

  function starStr(s) {
    var full = "★★★★★".slice(0, s);
    var off = 5 - s;
    return full + (off ? '<span class="star--off">' + "★★★★★".slice(0, off) + "</span>" : "");
  }

  function paint() {
    var c = data[index];
    var nx = data[(index + 1) % total];
    avatar.src = c.img;
    name.textContent = c.n;
    title.textContent = c.t;
    stars.innerHTML = starStr(c.s);
    stars.setAttribute("aria-label", c.s + "/5");
    quote.textContent = "“" + c.q + "”";
    miniName.textContent = nx.n;
    miniTitle.textContent = nx.t;
    miniAvatar.src = nx.img;
  }

  function go(i) {
    index = (i + total) % total;
    review.classList.add("is-fading");
    mini.classList.add("is-fading");
    setTimeout(function () {
      paint();
      review.classList.remove("is-fading");
      mini.classList.remove("is-fading");
    }, 320);
  }

  function start() { timer = setInterval(function () { go(index + 1); }, 5000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1); stop(); start(); });
  if (mini) mini.addEventListener("click", function () { go(index + 1); stop(); start(); });
  grid.addEventListener("mouseenter", stop);
  grid.addEventListener("mouseleave", start);

  paint();
  start();
})();

// Risk Testi — cmd+zest tarzı interaktif test (intro → quiz → lead → sonuç)
(function () {
  var overlay = document.getElementById("quizOverlay");
  var startBtn = document.getElementById("riskStart");
  var stage = document.getElementById("quizStage");
  if (!overlay || !startBtn || !stage) return;

  var closeBtn = document.getElementById("quizClose");
  var progressLabel = document.getElementById("quizProgressLabel");
  var prefersReduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // ----------------------------------------------------------- VERİ
  var sections = [
    {
      name: "İstasyon Profili",
      questions: [
        { q: "Şarj istasyonunuzun bulunduğu <em>alan</em> nedir?", o: [
          ["Site / Residence", 5], ["İş Yeri", 4], ["AVM", 3],
          ["Akaryakıt İstasyonu", 1], ["Filo Sahası", 3], ["Endüstriyel Tesis", 2]
        ]},
        { q: "Toplam kaç <em>şarj üniteniz</em> bulunuyor?", o: [
          ["1-2", 5], ["3-10", 4], ["11-25", 3], ["26-50", 2], ["50+", 1]
        ]},
        { q: "Şarj cihazlarınızın çoğu hangi <em>tiptedir</em>?", o: [
          ["AC", 5], ["DC Hızlı Şarj", 3], ["Ultra Hızlı DC", 2], ["Karışık", 3]
        ]},
        { q: "İstasyonlarınızın <em>yaşı</em> nedir?", o: [
          ["1 yıldan az", 5], ["1-3 yıl", 4], ["3-5 yıl", 3], ["5 yıldan fazla", 1]
        ]}
      ]
    },
    {
      name: "Elektrik ve Teknik Güvenlik",
      questions: [
        { q: "Son periyodik <em>bakım</em> ne zaman yapıldı?", o: [
          ["Son 3 ay", 5], ["Son 6 ay", 4], ["Son 12 ay", 2], ["12 aydan uzun süre önce", 0]
        ]},
        { q: "<em>Topraklama</em> ölçümleri düzenli yapılıyor mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0], ["Bilmiyorum", 1]
        ]},
        { q: "<em>Parafudr (SPD)</em> koruması mevcut mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0], ["Emin değilim", 1]
        ]},
        { q: "Son 24 ayda elektrik kaynaklı <em>arıza</em> yaşandı mı?", o: [
          ["Hayır", 5], ["1 kez", 3], ["Birkaç kez", 1], ["Sık sık", 0]
        ]}
      ]
    },
    {
      name: "Yangın ve Fiziksel Güvenlik",
      questions: [
        { q: "Yangın <em>algılama</em> sistemi mevcut mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0]
        ]},
        { q: "Yangın <em>söndürme</em> ekipmanları mevcut mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0]
        ]},
        { q: "Alan <em>7/24 kamera</em> ile izleniyor mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0]
        ]},
        { q: "Son 3 yılda <em>vandalizm, çarpma</em> veya fiziksel hasar yaşandı mı?", o: [
          ["Hayır", 5], ["1 kez", 3], ["Birden fazla kez", 0]
        ]}
      ]
    },
    {
      name: "Siber Güvenlik ve Operasyon",
      questions: [
        { q: "Şarj istasyonlarınız <em>internete</em> bağlı mı?", o: [
          ["Evet", 3], ["Hayır", 5]
        ]},
        { q: "<em>Yazılım güncellemeleri</em> düzenli uygulanıyor mu?", o: [
          ["Evet", 5], ["Bazen", 3], ["Hayır", 0], ["Bilmiyorum", 1]
        ]},
        { q: "Yönetim panelinde <em>çok faktörlü doğrulama (2FA)</em> kullanılıyor mu?", o: [
          ["Evet", 5], ["Hayır", 0], ["Bilmiyorum", 1]
        ]},
        { q: "<em>Uzaktan izleme</em> ve hata bildirim sistemi mevcut mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0]
        ]}
      ]
    },
    {
      name: "Sigorta ve Risk Yönetimi",
      questions: [
        { q: "Şarj istasyonunuza özel <em>sigorta teminatı</em> bulunuyor mu?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0]
        ]},
        { q: "Son 3 yılda sigortaya konu olabilecek bir <em>hasar</em> yaşadınız mı?", o: [
          ["Hayır", 5], ["1 kez", 3], ["Birden fazla kez", 0]
        ]},
        { q: "Bir ünitenin <em>7 gün devre dışı</em> kalması sizi ne kadar etkiler?", o: [
          ["Çok az", 5], ["Orta", 4], ["Ciddi", 2], ["Kritik", 1]
        ]},
        { q: "Risk yönetimi ve <em>bakım kayıtlarını</em> düzenli tutuyor musunuz?", o: [
          ["Evet", 5], ["Kısmen", 3], ["Hayır", 0]
        ]}
      ]
    }
  ];

  var introLines = [
    "Her şarj istasyonunun <em>görünmeyen</em> bir riski vardır.",
    "Çoğu zaman fark edilmeden büyür.",
    "Riskinizi <em>2 dakikada</em> keşfedin."
  ];

  var results = [
    { min: 80, emoji: "🟢", label: "Düşük Risk", cls: "is-risk-low",
      desc: "İstasyon altyapınız genel olarak iyi korunuyor." },
    { min: 60, emoji: "🟠", label: "Kontrollü Risk", cls: "is-risk-controlled",
      desc: "Bazı alanlarda iyileştirme fırsatları bulunuyor." },
    { min: 40, emoji: "🟡", label: "Yüksek Dikkat Gerekiyor", cls: "is-risk-attention",
      desc: "Hasar ve kesinti riskleri sektör ortalamasının üzerinde." },
    { min: 0, emoji: "🔴", label: "Kritik Risk", cls: "is-risk-critical",
      desc: "İstasyonlarınız önemli operasyonel ve finansal risklere maruz kalabilir." }
  ];

  // Soruları düz listeye çevir (puanlama ve ilerleme için)
  var flat = [];
  sections.forEach(function (s, si) {
    s.questions.forEach(function (qq) {
      flat.push({ section: si, q: qq.q, o: qq.o });
    });
  });
  var TOTAL = flat.length; // 20
  var KEYS = "abcdefgh";

  var answers = [];
  var current = 0;
  var lead = { name: "", email: "" };

  // ----------------------------------------------------------- WebGL ARKA PLAN
  function createBg(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) { gl = null; }

    if (!gl) {
      canvas.classList.add("no-webgl");
      return { start: function () {}, stop: function () {}, resize: function () {} };
    }

    var vsrc = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";
    var fsrc = [
      "precision highp float;",
      "uniform vec2 u_res;uniform float u_time;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float noise(vec2 p){vec2 i=floor(p),f=fract(p);",
      "float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
      "vec2 u=f*f*(3.-2.*f);",
      "return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;}",
      "float fbm(vec2 p){float v=0.,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}",
      "void main(){",
      "vec2 uv=gl_FragCoord.xy/u_res.xy;",
      "vec2 p=uv*3.0;p.x*=u_res.x/u_res.y;",
      "float t=u_time*0.05;",
      "float n=fbm(p+vec2(t,t*0.7)+fbm(p*1.5-t*0.3));",
      "n=pow(n,1.6);",
      "float g=smoothstep(0.15,0.92,n);",
      "vec3 col=mix(vec3(0.015),vec3(0.40),g);",
      "gl_FragColor=vec4(col,1.0);}"
    ].join("\n");

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.classList.add("no-webgl");
      return { start: function () {}, stop: function () {}, resize: function () {} };
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");

    var raf = null, t0 = Date.now(), running = false;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function frame() {
      if (!running) return;
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (Date.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running) return;
      running = true;
      if (prefersReduced) { resize(); gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uTime, 12.0); gl.drawArrays(gl.TRIANGLES, 0, 3); running = false; return; }
      frame();
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    return { start: start, stop: stop, resize: resize };
  }

  // Launcher arka planı (görünürken çalışır)
  var launcherBg = createBg(document.getElementById("riskLauncherBg"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) launcherBg.start(); else launcherBg.stop();
      });
    }, { threshold: 0.05 });
    io.observe(document.getElementById("risk-testi"));
  } else {
    launcherBg.start();
  }
  var quizBg = createBg(document.getElementById("quizBg"));

  // ----------------------------------------------------------- RENDER
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  }); }

  function setProgress(text) {
    progressLabel.textContent = text || "";
  }

  function renderIntro(done) {
    setProgress("");
    if (prefersReduced) { done(); return; }
    stage.innerHTML = '<div class="quiz-intro"></div>';
    var wrap = stage.firstChild;
    var i = 0;
    function next() {
      if (i >= introLines.length) { done(); return; }
      var el = document.createElement("p");
      el.className = "quiz-intro__line";
      el.innerHTML = introLines[i];
      wrap.innerHTML = "";
      wrap.appendChild(el);
      requestAnimationFrame(function () { el.classList.add("is-in"); });
      setTimeout(function () { el.classList.remove("is-in"); el.classList.add("is-out"); }, 1700);
      setTimeout(function () { i++; next(); }, 2300);
    }
    next();
  }

  function renderQuestion() {
    var item = flat[current];
    var sec = sections[item.section];
    var pct = (item.section + 1) * 20;
    setProgress("Bölüm " + (item.section + 1) + "/5 — " + sec.name + " · %" + pct);

    var stepsHtml = "";
    for (var si = 0; si < sections.length; si++) {
      var cls = "quiz-step";
      if (si < item.section) cls += " is-done";
      else if (si === item.section) cls += " is-active";
      stepsHtml += '<div class="' + cls + '">' + (si + 1) + "</div>";
    }

    var optsHtml = item.o.map(function (opt, oi) {
      var selected = answers[current] === oi ? " is-selected" : "";
      return '<button type="button" class="quiz-option' + selected + '" data-oi="' + oi + '">' +
        '<span class="quiz-option__key">' + KEYS[oi] + "</span>" + esc(opt[0]) + "</button>";
    }).join("");

    stage.innerHTML =
      '<div class="quiz-panel">' +
        '<div class="quiz-steps">' + stepsHtml + "</div>" +
        '<div class="quiz-body">' +
          '<span class="quiz-section-tag">Soru ' + (current + 1) + " / " + TOTAL + "</span>" +
          '<h3 class="quiz-question">' + item.q + "</h3>" +
          '<div class="quiz-options">' + optsHtml + "</div>" +
          '<div class="quiz-nav">' +
            '<button type="button" class="quiz-back"' + (current === 0 ? " hidden" : "") + ">← Geri</button>" +
          "</div>" +
        "</div>" +
      "</div>";

    var optButtons = stage.querySelectorAll(".quiz-option");
    Array.prototype.forEach.call(optButtons, function (b) {
      b.addEventListener("click", function () {
        answers[current] = parseInt(b.getAttribute("data-oi"), 10);
        b.classList.add("is-selected");
        setTimeout(function () {
          if (current < TOTAL - 1) { current++; renderQuestion(); }
          else { renderLead(); }
        }, 220);
      });
    });
    var back = stage.querySelector(".quiz-back");
    if (back) back.addEventListener("click", function () {
      if (current > 0) { current--; renderQuestion(); }
    });
  }

  function renderLead() {
    setProgress("Sonuç · Son adım");
    stage.innerHTML =
      '<div class="quiz-lead">' +
        "<h3>Skorunuz hazır.</h3>" +
        "<p>Kişiselleştirilmiş risk skorunuzu görüntülemek için bilgilerinizi girin.</p>" +
        '<form class="quiz-lead__form" id="quizLeadForm" novalidate>' +
          "<div><label for=\"qlName\">Ad Soyad</label>" +
          '<input type="text" id="qlName" name="name" placeholder="Adınız Soyadınız" value="' + esc(lead.name) + '" autocomplete="name" /></div>' +
          "<div><label for=\"qlEmail\">E-posta</label>" +
          '<input type="email" id="qlEmail" name="email" placeholder="ornek@firma.com" value="' + esc(lead.email) + '" autocomplete="email" /></div>' +
          '<div class="quiz-lead__error" id="qlError"></div>' +
          '<button type="submit" class="quiz-lead__submit">Skorumu Göster</button>' +
          '<p class="quiz-lead__hint">Bilgileriniz yalnızca size dönüş yapmak için kullanılır.</p>' +
        "</form>" +
      "</div>";

    var form = document.getElementById("quizLeadForm");
    var err = document.getElementById("qlError");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (name.length < 2) { err.textContent = "Lütfen adınızı girin."; form.name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Lütfen geçerli bir e-posta girin."; form.email.focus(); return; }
      lead.name = name; lead.email = email;
      renderResult();
    });
  }

  function computeScore() {
    var total = 0;
    flat.forEach(function (item, i) {
      var oi = answers[i];
      if (typeof oi === "number" && item.o[oi]) total += item.o[oi][1];
    });
    return Math.round((total / (TOTAL * 5)) * 100);
  }

  function resultFor(score) {
    for (var i = 0; i < results.length; i++) {
      if (score >= results[i].min) return results[i];
    }
    return results[results.length - 1];
  }

  function renderResult() {
    var score = computeScore();
    var r = resultFor(score);
    setProgress("");
    stage.innerHTML =
      '<div class="quiz-result ' + r.cls + '">' +
        '<div class="quiz-result__badge">' + r.emoji + "</div>" +
        '<div class="quiz-result__score">' + score + "<small>/100</small></div>" +
        '<div class="quiz-result__label">' + esc(r.label) + "</div>" +
        '<p class="quiz-result__desc">' + esc(r.desc) + "</p>" +
        '<div class="quiz-result__bar"><i style="width:0%;background:currentColor;"></i></div>' +
        '<div class="quiz-result__actions">' +
          '<a class="quiz-result__cta" href="#iletisim">Teklif Al</a>' +
          '<button type="button" class="quiz-result__retry">Testi Tekrarla</button>' +
        "</div>" +
      "</div>";

    var bar = stage.querySelector(".quiz-result__bar i");
    requestAnimationFrame(function () { bar.style.width = score + "%"; });

    var cta = stage.querySelector(".quiz-result__cta");
    cta.addEventListener("click", function () { closeQuiz(); });
    stage.querySelector(".quiz-result__retry").addEventListener("click", function () {
      answers = []; current = 0;
      renderIntro(renderQuestion);
    });
  }

  // ----------------------------------------------------------- AÇ / KAPAT
  function openQuiz() {
    answers = []; current = 0;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    quizBg.start();
    renderIntro(renderQuestion);
  }
  function closeQuiz() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    quizBg.stop();
  }

  startBtn.addEventListener("click", openQuiz);
  if (closeBtn) closeBtn.addEventListener("click", closeQuiz);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeQuiz();
  });
})();
