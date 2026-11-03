// rotation.js - Smart Shift Rotation Engine
(function(){
  var SH_TIMES = {
    mid: { i: '15:30', o: '23:30' },
    night: { i: '23:30', o: '07:30' },
    ram: { i: '07:30', o: '14:00' }
  };

  function generateRotation(startDateStr, patternSeq, daysCount, targetState) {
    if(!startDateStr || !patternSeq.length) return;
    var curr = new Date(startDateStr + 'T12:00:00');
    targetState.shifts = targetState.shifts || [];
    
    for(var i=0; i<daysCount; i++) {
      var shiftType = patternSeq[i % patternSeq.length];
      var y = curr.getFullYear(), m = String(curr.getMonth()+1).padStart(2,'0'), d = String(curr.getDate()).padStart(2,'0');
      var dateStr = y + '-' + m + '-' + d;
      
      if(shiftType !== 'off' && SH_TIMES[shiftType]) {
        var exists = targetState.shifts.some(function(s){ return s.date === dateStr; });
        if(!exists) {
          targetState.shifts.push({
            id: Date.now() + i,
            date: dateStr,
            type: shiftType,
            'in': SH_TIMES[shiftType].i,
            out: SH_TIMES[shiftType].o
          });
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  function renderRotationCard(defaultDate) {
    return '<div class="card" style="border-color:var(--pr);">' +
      '<h2>⚡ مولد الورديات التناوبي الذكي</h2>' +
      '<div class="sub">ولّد جدول الورديات للشهر بالكامل تلقائياً بنمط دوراني تكراري.</div>' +
      '<label>تاريخ بدء الدورة</label><input type="date" id="rot_sd" value="' + defaultDate + '">' +
      '<label>نمط التكرار (اختر نوع الورديات بالتتابع)</label>' +
      '<div class="row">' +
        '<div><select id="r_p1"><option value="mid">وسط</option><option value="night">ليلية</option><option value="off">راحة</option></select></div>' +
        '<div><select id="r_p2"><option value="mid">وسط</option><option value="night" selected>ليلية</option><option value="off">راحة</option></select></div>' +
        '<div><select id="r_p3"><option value="off" selected>راحة</option><option value="mid">وسط</option><option value="night">ليلية</option></select></div>' +
      '</div>' +
      '<label style="margin-top:8px">عدد الأيام المراد توليدها</label>' +
      '<input type="number" id="rot_days" value="30" min="1" max="90">' +
      '<button data-a="gen_rot" style="background:var(--pr);">توليد جدول الورديات التلقائي</button>' +
    '</div>';
  }

  function handleGenerateAction(state) {
    var sd = document.getElementById('rot_sd').value;
    var p1 = document.getElementById('r_p1').value;
    var p2 = document.getElementById('r_p2').value;
    var p3 = document.getElementById('r_p3').value;
    var days = parseInt(document.getElementById('rot_days').value) || 30;
    
    if(!sd) return alert('يرجى تحديد تاريخ البداية');
    generateRotation(sd, [p1, p2, p3], days, state);
    alert('تم توليد جدول الورديات بنجاح! ✅');
  }

  window.RotationModule = {
    renderCard: renderRotationCard,
    generate: handleGenerateAction
  };
})();
