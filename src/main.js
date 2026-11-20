import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import './styles/main.css';
import { INITIAL_STATE } from './data/demo-state.js';

const DEFAULT_AVATAR = './avatars/profile.jpg';

    class HeroesApp {
      constructor() {
        this.state = JSON.parse(localStorage.getItem('heroes_hr_v2_state')) || INITIAL_STATE;
        this.currentTab = 'dashboard';
        this.empViewMode = 'table';
        this.atsViewMode = 'kanban';
        this.leaveSubtab = 'list';
        this.activeInterviewFilter = 'today';
        this.clockedIn = true;
      }

      init() {
        this.saveState();
        this.updateDynamicGreeting();
        this.renderAll();
        this.setupEventListeners();
      }

      saveState() {
        localStorage.setItem('heroes_hr_v2_state', JSON.stringify(this.state));
      }

      logAudit(action, details) {
        this.state.auditLogs.unshift({
          id: Date.now(),
          action,
          details,
          timestamp: new Date().toLocaleTimeString()
        });
        this.saveState();
      }

      showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : 'bg-obsidian-900 text-white border border-obsidian-700');
        toast.className = `${bgClass} px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 pointer-events-auto`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald-300' : 'fa-circle-info text-heroIndigo-300'}"></i> ${msg}`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2'), 10);
        setTimeout(() => {
          toast.classList.add('opacity-0', 'translate-y-2');
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }

      confirmAction(title, msg, onConfirm) {
        const modal = document.getElementById('modal-confirm');
        document.getElementById('confirm-title').innerText = title;
        document.getElementById('confirm-msg').innerText = msg;
        modal.classList.remove('hidden');

        const cancelBtn = document.getElementById('confirm-btn-cancel');
        const actionBtn = document.getElementById('confirm-btn-action');

        const cleanup = () => {
          modal.classList.add('hidden');
          cancelBtn.onclick = null;
          actionBtn.onclick = null;
        };

        cancelBtn.onclick = cleanup;
        actionBtn.onclick = () => {
          cleanup();
          onConfirm();
        };
      }

      updateDynamicGreeting() {
        const hour = new Date().getHours();
        let greeting = "Good Morning";
        if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
        else if (hour >= 17) greeting = "Good Evening";
        document.getElementById('hero-greeting-text').innerText = greeting;
      }

      switchTab(tabId, params = null) {
        this.currentTab = tabId;
        document.querySelectorAll('main > div').forEach(div => div.classList.add('hidden'));
        document.getElementById(`view-${tabId}`).classList.remove('hidden');

        document.querySelectorAll('.nav-btn').forEach(btn => {
          btn.classList.remove('bg-white/10', 'text-white');
          btn.classList.add('text-slate-300');
        });
        const activeNav = document.getElementById(`nav-${tabId}`);
        if (activeNav) {
          activeNav.classList.add('bg-white/10', 'text-white');
          activeNav.classList.remove('text-slate-300');
        }

        if (tabId === 'employees' && params && params.filter === 'new') {
          document.getElementById('emp-status-filter').value = 'New Joinee';
          this.renderEmployeesView();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      renderAll() {
        this.renderDashboardKPIs();
        this.renderAttendanceChart('year');
        this.renderNewsEvents();
        this.renderRecentCandidates();
        this.renderInterviews();
        this.renderProjectOverviewTiles();
        this.renderEmployeesView();
        this.renderJobsView();
        this.renderATSView();
        this.renderLeavesView();
        this.renderNotifications();
      }

      // ================= DASHBOARD RENDERERS =================
      renderDashboardKPIs() {
        const totalEmp = this.state.employees.length;
        const baselineTotal = 200; // calibrated scale
        const displayTotal = totalEmp + 194; // keep ~200 scale dynamically synced

        const onLeave = this.state.employees.filter(e => e.status === 'On Leave').length + 11;
        const newJoinee = this.state.employees.filter(e => e.status === 'New Joinee').length + 14;

        document.getElementById('kpi-total-emp').innerText = `${displayTotal}/200`;
        document.getElementById('kpi-on-leave').innerText = `${onLeave}/200`;
        document.getElementById('kpi-new-joinee').innerText = `${newJoinee}/200`;
        document.getElementById('kpi-happiness-rate').innerText = `${this.state.happinessRate}%`;

        // Calculate Work Mode Donut
        const officeCount = this.state.employees.filter(e => e.mode === 'Office').length;
        const totalCount = this.state.employees.length || 1;
        const officePct = Math.round((officeCount / totalCount) * 100);
        const remotePct = 100 - officePct;

        document.getElementById('donut-center-total').innerText = displayTotal;
        document.getElementById('donut-office-pct').innerText = `${officePct}%`;
        document.getElementById('donut-remote-pct').innerText = `${remotePct}%`;
        
        document.getElementById('donut-office-arc').setAttribute('stroke-dasharray', `${officePct}, 100`);
        document.getElementById('donut-remote-arc').setAttribute('stroke-dasharray', `${remotePct}, 100`);
        document.getElementById('donut-remote-arc').setAttribute('stroke-dashoffset', `-${officePct}`);
      }

      renderAttendanceChart(range = 'year') {
        const container = document.getElementById('attendance-bars-container');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        // Dynamic mock values for 12 capsule bars
        const data = [
          { month: 'JAN', onTime: 150, late: 35, absent: 15, latePct: '22%' },
          { month: 'FEB', onTime: 142, late: 48, absent: 10, latePct: '28%' }, // Screenshot featured bar
          { month: 'MAR', onTime: 160, late: 25, absent: 15, latePct: '16%' },
          { month: 'APR', onTime: 155, late: 30, absent: 15, latePct: '19%' },
          { month: 'MAY', onTime: 168, late: 20, absent: 12, latePct: '13%' },
          { month: 'JUN', onTime: 140, late: 45, absent: 15, latePct: '27%' },
          { month: 'JUL', onTime: 172, late: 18, absent: 10, latePct: '11%' },
          { month: 'AUG', onTime: 165, late: 22, absent: 13, latePct: '14%' },
          { month: 'SEP', onTime: 150, late: 38, absent: 12, latePct: '24%' },
          { month: 'OCT', onTime: 158, late: 28, absent: 14, latePct: '18%' },
          { month: 'NOV', onTime: 162, late: 26, absent: 12, latePct: '16%' },
          { month: 'DEC', onTime: 145, late: 40, absent: 15, latePct: '25%' },
        ];

        container.innerHTML = data.map((d, idx) => {
          const total = 200;
          const hOnTime = (d.onTime / total) * 100;
          const hLate = (d.late / total) * 100;
          const hAbsent = (d.absent / total) * 100;

          return `
            <div class="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer capsule-group" 
                 onmouseenter="app.showAttendanceTooltip('${d.month}', '${d.latePct}', ${d.onTime}, ${d.late}, ${d.absent})" 
                 onmouseleave="app.hideAttendanceTooltip()">
              <!-- Stacked Capsules Bar Column -->
              <div class="w-full max-w-[28px] sm:max-w-[36px] flex flex-col items-center justify-end h-full gap-[3px]">
                <!-- Top Absent Capsule -->
                <div class="w-full bg-slate-200 rounded-t-xl capsule-top" style="height: ${hAbsent}%"></div>
                <!-- Middle Late Capsule -->
                <div class="w-full bg-heroIndigo-400 capsule-top" style="height: ${hLate}%"></div>
                <!-- Bottom On Time Capsule -->
                <div class="w-full bg-obsidian-900 rounded-b-xl capsule-top" style="height: ${hOnTime}%"></div>
              </div>
              <span class="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-slate-900 mt-2 transition-colors">${d.month}</span>
            </div>
          `;
        }).join('');
      }

      showAttendanceTooltip(month, latePct, onTime, late, absent) {
        const tooltip = document.getElementById('attendance-tooltip');
        document.getElementById('tooltip-month').innerText = `${month} 2026`;
        document.getElementById('tooltip-stat').innerText = `${latePct} Late Arrives`;
        document.getElementById('tooltip-detail').innerText = `On Time: ${onTime} • Late: ${late} • Absent: ${absent}`;
        tooltip.classList.remove('hidden');
      }

      hideAttendanceTooltip() {
        document.getElementById('attendance-tooltip').classList.add('hidden');
      }

      renderNewsEvents() {
        const grid = document.getElementById('news-events-grid');
        grid.innerHTML = this.state.events.slice(0, 6).map(evt => `
          <div onclick="app.openEventDetailModal('${evt.id}')" class="bg-slate-50 hover:bg-heroIndigo-50/50 p-3.5 rounded-2xl border border-slate-100/80 transition duration-200 cursor-pointer flex items-start gap-3 group">
            <div class="w-12 h-12 rounded-2xl bg-heroIndigo-100/80 text-heroIndigo-900 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-heroIndigo-600 group-hover:text-white transition-colors">
              <span class="text-xs font-extrabold leading-none">${evt.dateDay}</span>
              <span class="text-[9px] font-bold uppercase tracking-wider mt-0.5">${evt.dateMonth}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-xs text-slate-900 truncate group-hover:text-heroIndigo-600 transition-colors">${evt.title}</h4>
              <p class="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">${evt.desc}</p>
            </div>
          </div>
        `).join('');
      }

      renderRecentCandidates() {
        const container = document.getElementById('recent-candidates-list');
        container.innerHTML = this.state.candidates.slice(0, 4).map(can => `
          <div onclick="app.openCandidateDrawer('${can.id}')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer">
            <div class="flex items-center gap-3">
              <img src="${can.avatar}" alt="" class="w-9 h-9 rounded-xl object-cover">
              <div>
                <h4 class="font-bold text-xs text-slate-900">${can.name}</h4>
                <p class="text-[10px] text-slate-400 font-medium">${can.country}</p>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-1 rounded-lg bg-heroIndigo-50 text-heroIndigo-700">${can.role}</span>
          </div>
        `).join('');
      }

      renderInterviews() {
        const grid = document.getElementById('interviews-grid');
        const filtered = this.state.interviews.filter(i => i.day === this.activeInterviewFilter);
        
        document.getElementById('interview-count-badge').innerText = `${filtered.length} Scheduled`;

        if (filtered.length === 0) {
          grid.innerHTML = `<div class="col-span-2 text-center py-6 text-xs text-slate-400 font-medium">No interviews scheduled for ${this.activeInterviewFilter}.</div>`;
          return;
        }

        grid.innerHTML = filtered.map(item => `
          <div class="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between hover:border-heroIndigo-200 transition">
            <div class="flex items-center gap-3">
              <img src="${item.avatar}" alt="" class="w-10 h-10 rounded-xl object-cover">
              <div>
                <h4 class="font-bold text-xs text-slate-900">${item.candidateName}</h4>
                <p class="text-[11px] text-slate-500 font-medium">${item.role}</p>
              </div>
            </div>
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-heroIndigo-100 text-heroIndigo-900 flex items-center gap-1">
              <i class="fa-solid fa-clock text-[9px]"></i> ${item.time}
            </span>
          </div>
        `).join('');
      }

      filterInterviews(day) {
        this.activeInterviewFilter = day;
        document.getElementById('interview-tab-today').className = day === 'today' ? 'px-3 py-1 rounded-lg text-xs font-bold text-white bg-obsidian-900 shadow-sm transition' : 'px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition';
        document.getElementById('interview-tab-tomorrow').className = day === 'tomorrow' ? 'px-3 py-1 rounded-lg text-xs font-bold text-white bg-obsidian-900 shadow-sm transition' : 'px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition';
        this.renderInterviews();
      }

      renderProjectOverviewTiles() {
        const total = this.state.projects.length;
        const hold = this.state.projects.filter(p => p.status === 'On Hold').length;
        const active = this.state.projects.filter(p => p.status === 'Active').length;

        document.getElementById('proj-tile-total').innerText = total + 122;
        document.getElementById('proj-tile-hold').innerText = hold + 12;
        document.getElementById('proj-tile-active').innerText = active + 39;
      }


      // ================= EMPLOYEES MODULE RENDERERS =================
      renderEmployeesView() {
        const container = document.getElementById('employees-content-container');
        const search = document.getElementById('emp-search').value.toLowerCase();
        const dept = document.getElementById('emp-dept-filter').value;
        const mode = document.getElementById('emp-mode-filter').value;
        const status = document.getElementById('emp-status-filter').value;

        let filtered = this.state.employees.filter(e => {
          const matchSearch = e.name.toLowerCase().includes(search) || e.role.toLowerCase().includes(search) || e.email.toLowerCase().includes(search);
          const matchDept = dept === 'ALL' || e.department === dept;
          const matchMode = mode === 'ALL' || e.mode === mode;
          const matchStatus = status === 'ALL' || e.status === status;
          return matchSearch && matchDept && matchMode && matchStatus;
        });

        if (this.empViewMode === 'table') {
          container.innerHTML = `
            <div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th class="p-4 pl-6"><input type="checkbox" onchange="app.toggleSelectAllEmps(this)" class="rounded border-slate-300 text-heroIndigo-600"></th>
                      <th class="p-4">Employee</th>
                      <th class="p-4">Department & Role</th>
                      <th class="p-4">Work Mode</th>
                      <th class="p-4">Status</th>
                      <th class="p-4">Salary</th>
                      <th class="p-4 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-xs">
                    ${filtered.map(emp => `
                      <tr class="hover:bg-slate-50/80 transition">
                        <td class="p-4 pl-6"><input type="checkbox" value="${emp.id}" onchange="app.updateEmpSelection()" class="emp-checkbox rounded border-slate-300 text-heroIndigo-600"></td>
                        <td class="p-4 font-bold text-slate-900 cursor-pointer" onclick="app.openEmployeeDrawer('${emp.id}')">
                          <div class="flex items-center gap-3">
                            <img src="${emp.avatar}" alt="" onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}'" class="w-9 h-9 rounded-xl object-cover">
                            <div>
                              <div>${emp.name}</div>
                              <div class="text-[11px] text-slate-400 font-normal">${emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td class="p-4">
                          <div class="font-semibold text-slate-800">${emp.role}</div>
                          <div class="text-[10px] text-slate-400 uppercase font-bold">${emp.department}</div>
                        </td>
                        <td class="p-4">
                          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.mode === 'Remote' ? 'bg-purple-50 text-purple-700' : (emp.mode === 'Hybrid' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700')}">
                            ${emp.mode}
                          </span>
                        </td>
                        <td class="p-4">
                          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : (emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700' : 'bg-heroIndigo-50 text-heroIndigo-700')}">
                            ${emp.status}
                          </span>
                        </td>
                        <td class="p-4 font-bold text-slate-900">$${Number(emp.salary).toLocaleString()}/yr</td>
                        <td class="p-4 text-right pr-6">
                          <button onclick="app.openEmployeeDrawer('${emp.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition">View 360°</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${filtered.map(emp => `
                <div onclick="app.openEmployeeDrawer('${emp.id}')" class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition cursor-pointer">
                  <div class="flex items-center gap-4">
                    <img src="${emp.avatar}" alt="" onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}'" class="w-14 h-14 rounded-2xl object-cover">
                    <div>
                      <h4 class="font-extrabold text-sm text-slate-900">${emp.name}</h4>
                      <p class="text-xs text-heroIndigo-600 font-bold">${emp.role}</p>
                      <p class="text-[11px] text-slate-400 font-medium">${emp.department}</p>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-700">$${Number(emp.salary).toLocaleString()}/yr</span>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${emp.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      setEmployeesViewMode(mode) {
        this.empViewMode = mode;
        document.getElementById('btn-view-table').className = mode === 'table' ? 'flex-1 py-1 rounded-lg text-xs font-bold text-white bg-obsidian-900 shadow-sm transition flex items-center justify-center gap-1.5' : 'flex-1 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5';
        document.getElementById('btn-view-grid').className = mode === 'grid' ? 'flex-1 py-1 rounded-lg text-xs font-bold text-white bg-obsidian-900 shadow-sm transition flex items-center justify-center gap-1.5' : 'flex-1 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5';
        this.renderEmployeesView();
      }

      toggleSelectAllEmps(master) {
        document.querySelectorAll('.emp-checkbox').forEach(cb => cb.checked = master.checked);
        this.updateEmpSelection();
      }

      updateEmpSelection() {
        const checked = document.querySelectorAll('.emp-checkbox:checked');
        const bulkBar = document.getElementById('emp-bulk-bar');
        document.getElementById('emp-selected-count').innerText = checked.length;
        if (checked.length > 0) bulkBar.classList.remove('hidden');
        else bulkBar.classList.add('hidden');
      }

      openEmployeeDrawer(id) {
        const emp = this.state.employees.find(e => e.id === id);
        if (!emp) return;

        const content = document.getElementById('employee-drawer-content');
        content.innerHTML = `
          <div class="text-center">
            <img src="${emp.avatar}" alt="" onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}'" class="w-24 h-24 rounded-3xl object-cover mx-auto shadow-lg ring-4 ring-heroIndigo-50">
            <h3 class="font-extrabold text-xl text-slate-900 mt-3">${emp.name}</h3>
            <p class="text-xs font-bold text-heroIndigo-600">${emp.role}</p>
            <p class="text-xs text-slate-400 mt-0.5">${emp.email} • ${emp.country}</p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
            <div>
              <span class="text-slate-400 font-medium">Department</span>
              <p class="font-bold text-slate-900">${emp.department}</p>
            </div>
            <div>
              <span class="text-slate-400 font-medium">Work Mode</span>
              <p class="font-bold text-slate-900">${emp.mode}</p>
            </div>
            <div>
              <span class="text-slate-400 font-medium">Annual Salary</span>
              <p class="font-bold text-emerald-600">$${Number(emp.salary).toLocaleString()}</p>
            </div>
            <div>
              <span class="text-slate-400 font-medium">Status</span>
              <p class="font-bold text-slate-900">${emp.status}</p>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-xs text-slate-900 mb-2">Assigned Projects</h4>
            <div class="space-y-2">
              ${this.state.projects.map(p => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-800">${p.title}</span>
                  <span class="font-bold text-heroIndigo-600">${p.progress}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        document.getElementById('employee-drawer-actions').innerHTML = `
          <button onclick="app.confirmDeleteEmployee('${emp.id}')" class="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100">Delete Employee</button>
          <button onclick="app.editEmployee('${emp.id}')" class="px-5 py-2 rounded-xl bg-heroIndigo-600 text-white font-bold text-xs hover:bg-heroIndigo-700 shadow-sm">Edit Profile</button>
        `;

        document.getElementById('drawer-employee').classList.remove('hidden');
      }

      closeEmployeeDrawer() {
        document.getElementById('drawer-employee').classList.add('hidden');
      }

      openEmployeeModal(editId = null) {
        const form = document.getElementById('form-employee');
        form.reset();
        document.getElementById('emp-form-id').value = '';

        if (editId) {
          const emp = this.state.employees.find(e => e.id === editId);
          if (emp) {
            document.getElementById('modal-emp-title').innerText = 'Edit Employee Profile';
            document.getElementById('emp-form-id').value = emp.id;
            document.getElementById('emp-form-name').value = emp.name;
            document.getElementById('emp-form-email').value = emp.email;
            document.getElementById('emp-form-role').value = emp.role;
            document.getElementById('emp-form-dept').value = emp.department;
            document.getElementById('emp-form-mode').value = emp.mode;
            document.getElementById('emp-form-status').value = emp.status;
            document.getElementById('emp-form-salary').value = emp.salary;
            document.getElementById('emp-form-country').value = emp.country;
            document.getElementById('emp-form-avatar').value = emp.avatar.startsWith('./avatars/') ? '' : emp.avatar;
          }
        } else {
          document.getElementById('modal-emp-title').innerText = 'Add New Employee';
        }

        document.getElementById('modal-employee').classList.remove('hidden');
      }

      closeEmployeeModal() {
        document.getElementById('modal-employee').classList.add('hidden');
      }

      saveEmployee(e) {
        e.preventDefault();
        const id = document.getElementById('emp-form-id').value;
        const name = document.getElementById('emp-form-name').value;
        const email = document.getElementById('emp-form-email').value;
        const role = document.getElementById('emp-form-role').value;
        const dept = document.getElementById('emp-form-dept').value;
        const mode = document.getElementById('emp-form-mode').value;
        const status = document.getElementById('emp-form-status').value;
        const salary = Number(document.getElementById('emp-form-salary').value);
        const country = document.getElementById('emp-form-country').value;
        const savedAvatar = this.state.employees.find(emp => emp.id === id)?.avatar;
        const avatar = document.getElementById('emp-form-avatar').value
          || (savedAvatar?.startsWith('./avatars/') ? savedAvatar : DEFAULT_AVATAR);

        if (id) {
          const idx = this.state.employees.findIndex(e => e.id === id);
          if (idx !== -1) {
            this.state.employees[idx] = { id, name, email, role, department: dept, mode, status, salary, country, avatar };
            this.logAudit('UPDATE_EMP', `Updated profile for ${name}`);
            this.showToast(`Updated ${name} profile`, 'success');
          }
        } else {
          const newEmp = {
            id: 'EMP-' + Math.floor(100 + Math.random() * 900),
            name, email, role, department: dept, mode, status, salary, country, avatar
          };
          this.state.employees.unshift(newEmp);
          this.logAudit('CREATE_EMP', `Added new employee ${name}`);
          this.showToast(`Employee ${name} added successfully!`, 'success');
        }

        this.saveState();
        this.closeEmployeeModal();
        this.closeEmployeeDrawer();
        this.renderAll();
      }

      editEmployee(id) {
        this.closeEmployeeDrawer();
        this.openEmployeeModal(id);
      }

      confirmDeleteEmployee(id) {
        const emp = this.state.employees.find(e => e.id === id);
        this.confirmAction('Delete Employee', `Are you sure you want to remove ${emp ? emp.name : 'this employee'}?`, () => {
          this.state.employees = this.state.employees.filter(e => e.id !== id);
          this.logAudit('DELETE_EMP', `Deleted employee ${id}`);
          this.saveState();
          this.closeEmployeeDrawer();
          this.renderAll();
          this.showToast('Employee deleted', 'info');
        });
      }


      // ================= JOBS MODULE RENDERERS =================
      renderJobsView() {
        const grid = document.getElementById('jobs-cards-grid');
        grid.innerHTML = this.state.jobs.map(job => `
          <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${job.status === 'Open' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${job.status}</span>
                <span class="text-xs font-bold text-slate-400">${job.location}</span>
              </div>
              <h3 class="font-extrabold text-base text-slate-900 mt-2">${job.title}</h3>
              <p class="text-xs font-bold text-heroIndigo-600 mt-0.5">${job.department}</p>
              
              <div class="mt-4 flex flex-wrap gap-1.5">
                ${job.tags.map(t => `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">${t}</span>`).join('')}
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div class="text-xs font-extrabold text-slate-900">${job.salary}</div>
                <div class="text-[10px] text-slate-400 font-medium">${job.applicants} Applicants</div>
              </div>
              <button onclick="app.showToast('Job application link copied to clipboard!', 'success')" class="px-3 py-1.5 rounded-xl bg-heroIndigo-50 hover:bg-heroIndigo-100 text-heroIndigo-700 text-xs font-bold transition">Share Link</button>
            </div>
          </div>
        `).join('');
      }

      openJobModal() {
        this.showToast('Job Requisition Modal ready for posting', 'info');
      }


      // ================= CANDIDATES ATS MODULE =================
      renderATSView() {
        const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
        const kanbanContainer = document.getElementById('ats-kanban-view');

        kanbanContainer.innerHTML = stages.map(stage => {
          const list = this.state.candidates.filter(c => c.stage === stage);
          return `
            <div class="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/60 min-h-[450px] flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-extrabold text-xs text-slate-800 uppercase tracking-wider">${stage}</h4>
                  <span class="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-sm">${list.length}</span>
                </div>

                <div class="space-y-3">
                  ${list.map(c => `
                    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 space-y-3 hover:shadow-md transition">
                      <div class="flex items-center justify-between">
                        <img src="${c.avatar}" alt="" class="w-8 h-8 rounded-xl object-cover">
                        <span class="text-xs font-extrabold text-heroAmber-500 flex items-center gap-1"><i class="fa-solid fa-star text-[10px]"></i> ${c.score}</span>
                      </div>
                      <div>
                        <h5 class="font-bold text-xs text-slate-900">${c.name}</h5>
                        <p class="text-[10px] text-slate-400 font-medium">${c.role} • ${c.country}</p>
                      </div>

                      ${stage === 'Hired' ? `
                        <button onclick="app.convertCandidateToEmployee('${c.id}')" class="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-sm">
                          Convert to Employee
                        </button>
                      ` : `
                        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button onclick="app.moveCandidateStage('${c.id}', -1)" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center"><i class="fa-solid fa-chevron-left text-[9px]"></i></button>
                          <span class="text-[9px] font-bold text-slate-400 uppercase">Move</span>
                          <button onclick="app.moveCandidateStage('${c.id}', 1)" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center"><i class="fa-solid fa-chevron-right text-[9px]"></i></button>
                        </div>
                      `}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      setATSViewMode(mode) {
        this.atsViewMode = mode;
        if (mode === 'kanban') {
          document.getElementById('ats-kanban-view').classList.remove('hidden');
          document.getElementById('ats-table-view').classList.add('hidden');
        } else {
          document.getElementById('ats-kanban-view').classList.add('hidden');
          document.getElementById('ats-table-view').classList.remove('hidden');
        }
      }

      moveCandidateStage(id, dir) {
        const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
        const can = this.state.candidates.find(c => c.id === id);
        if (!can) return;

        const currentIdx = stages.indexOf(can.stage);
        const newIdx = currentIdx + dir;

        if (newIdx >= 0 && newIdx < stages.length) {
          can.stage = stages[newIdx];
          this.saveState();
          this.renderATSView();
          this.showToast(`Moved ${can.name} to ${can.stage}`, 'success');
        }
      }

      convertCandidateToEmployee(canId) {
        const can = this.state.candidates.find(c => c.id === canId);
        if (!can) return;

        const newEmp = {
          id: 'EMP-' + Math.floor(100 + Math.random() * 900),
          name: can.name,
          email: `${can.name.toLowerCase().replace(' ', '.')}@heroes.hr`,
          role: can.role,
          department: 'Engineering',
          mode: 'Office',
          status: 'Active',
          salary: 135000,
          country: can.country,
          avatar: can.avatar
        };

        this.state.employees.unshift(newEmp);
        this.state.candidates = this.state.candidates.filter(c => c.id !== canId);
        this.saveState();
        this.renderAll();
        this.showToast(`Onboarded ${can.name} as active Employee!`, 'success');
      }

      openCandidateModal() {
        this.showToast('Add Candidate modal ready', 'info');
      }

      openCandidateDrawer(id) {
        this.showToast(`Candidate details for ${id}`, 'info');
      }


      // ================= LEAVES MODULE =================
      renderLeavesView() {
        const container = document.getElementById('leave-list-container');
        container.innerHTML = `
          <div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th class="p-4 pl-6">Employee</th>
                    <th class="p-4">Leave Type</th>
                    <th class="p-4">Dates & Duration</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right pr-6">Quick Approval</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  ${this.state.leaves.map(lev => `
                    <tr class="hover:bg-slate-50/80 transition">
                      <td class="p-4 pl-6 font-bold text-slate-900">${lev.empName}</td>
                      <td class="p-4 font-semibold text-slate-700">${lev.type}</td>
                      <td class="p-4 text-slate-500 font-medium">${lev.startDate} to ${lev.endDate} (${lev.days} days)</td>
                      <td class="p-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${lev.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${lev.status}</span>
                      </td>
                      <td class="p-4 text-right pr-6">
                        ${lev.status === 'Pending' ? `
                          <button onclick="app.approveLeave('${lev.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition mr-1">Approve</button>
                          <button onclick="app.rejectLeave('${lev.id}')" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition">Reject</button>
                        ` : `
                          <span class="text-xs text-slate-400 font-semibold"><i class="fa-solid fa-check text-emerald-500"></i> Processed</span>
                        `}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      setLeaveSubtab(sub) {
        this.leaveSubtab = sub;
        document.getElementById('leave-subtab-list').className = sub === 'list' ? 'px-4 py-2 rounded-xl text-xs font-bold bg-obsidian-900 text-white shadow-sm' : 'px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition';
        document.getElementById('leave-subtab-cal').className = sub === 'calendar' ? 'px-4 py-2 rounded-xl text-xs font-bold bg-obsidian-900 text-white shadow-sm' : 'px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition';
        
        if (sub === 'list') {
          document.getElementById('leave-list-container').classList.remove('hidden');
          document.getElementById('leave-calendar-container').classList.add('hidden');
        } else {
          document.getElementById('leave-list-container').classList.add('hidden');
          document.getElementById('leave-calendar-container').classList.remove('hidden');
          document.getElementById('leave-calendar-container').innerHTML = `<p class="text-xs text-slate-500 font-bold text-center py-8">Monthly Team Leave Calendar synchronized with Google Calendar.</p>`;
        }
      }

      approveLeave(id) {
        const lev = this.state.leaves.find(l => l.id === id);
        if (lev) {
          lev.status = 'Approved';
          this.saveState();
          this.renderLeavesView();
          this.renderDashboardKPIs();
          this.showToast(`Approved leave for ${lev.empName}`, 'success');
        }
      }

      rejectLeave(id) {
        const lev = this.state.leaves.find(l => l.id === id);
        if (lev) {
          lev.status = 'Rejected';
          this.saveState();
          this.renderLeavesView();
          this.showToast(`Rejected leave for ${lev.empName}`, 'info');
        }
      }

      openLeaveModal() {
        this.showToast('Time-off request modal opened', 'info');
      }


      // ================= HAPPINESS PULSE MODAL =================
      openHappinessModal() {
        document.getElementById('pulse-range').value = this.state.happinessRate;
        document.getElementById('pulse-val').innerText = `${this.state.happinessRate}%`;
        document.getElementById('pulse-current-display').innerText = `${this.state.happinessRate}%`;
        document.getElementById('modal-happiness').classList.remove('hidden');
      }

      closeHappinessModal() {
        document.getElementById('modal-happiness').classList.add('hidden');
      }

      updateHappinessRate() {
        const val = Number(document.getElementById('pulse-range').value);
        this.state.happinessRate = val;
        this.saveState();
        this.closeHappinessModal();
        this.renderDashboardKPIs();
        this.showToast(`Satisfaction pulse updated to ${val}%`, 'success');
      }


      // ================= PROJECT MANAGER MODAL =================
      openProjectManagerModal(filter = null) {
        const container = document.getElementById('project-list-container');
        container.innerHTML = this.state.projects.map(p => `
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-xs text-slate-900">${p.title}</h4>
              <p class="text-[10px] text-slate-400 font-medium">Lead: ${p.lead} • ${p.dept}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-extrabold text-heroIndigo-600">${p.progress}%</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${p.status}</span>
            </div>
          </div>
        `).join('');

        document.getElementById('modal-project').classList.remove('hidden');
      }

      closeProjectManagerModal() {
        document.getElementById('modal-project').classList.add('hidden');
      }


      // ================= INTERVIEW SCHEDULE MODAL =================
      openScheduleInterviewModal() {
        document.getElementById('modal-interview').classList.remove('hidden');
      }

      closeScheduleInterviewModal() {
        document.getElementById('modal-interview').classList.add('hidden');
      }

      saveInterview(e) {
        e.preventDefault();
        const candidateName = document.getElementById('int-form-candidate').value;
        const role = document.getElementById('int-form-role').value;
        const day = document.getElementById('int-form-day').value;
        const time = document.getElementById('int-form-time').value;

        const newInt = {
          id: 'INT-' + Math.floor(100 + Math.random() * 900),
          candidateName, role, day, time,
          avatar: this.state.candidates.find(candidate => candidate.name === candidateName)?.avatar || DEFAULT_AVATAR
        };

        this.state.interviews.unshift(newInt);
        this.saveState();
        this.closeScheduleInterviewModal();
        this.renderInterviews();
        this.showToast(`Scheduled interview with ${candidateName}`, 'success');
      }


      // ================= NEWS & EVENTS MODAL =================
      openEventModal() {
        this.showToast('Event Creation Modal ready', 'info');
      }

      openEventDetailModal(id) {
        const evt = this.state.events.find(e => e.id === id);
        if (evt) {
          this.showToast(`Event: ${evt.title}`, 'info');
        }
      }


      // ================= COMMAND PALETTE (CTRL+K) =================
      openCommandPalette() {
        document.getElementById('modal-command-palette').classList.remove('hidden');
        document.getElementById('cmd-input').focus();
        this.searchCommandPalette('');
      }

      closeCommandPalette() {
        document.getElementById('modal-command-palette').classList.add('hidden');
      }

      searchCommandPalette(query) {
        const q = query.toLowerCase();
        const results = document.getElementById('cmd-results');
        
        let html = '';
        html += `<div class="p-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quick Actions</div>`;
        html += `<div onclick="app.closeCommandPalette(); app.openEmployeeModal();" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-obsidian-700 cursor-pointer font-semibold flex items-center justify-between"><span class="text-slate-800 dark:text-slate-200"><i class="fa-solid fa-user-plus text-heroIndigo-500 mr-2"></i> Add New Employee</span><kbd class="text-[10px] text-slate-400 font-mono">Action</kbd></div>`;
        html += `<div onclick="app.closeCommandPalette(); app.switchTab('candidates');" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-obsidian-700 cursor-pointer font-semibold flex items-center justify-between"><span class="text-slate-800 dark:text-slate-200"><i class="fa-solid fa-columns text-emerald-500 mr-2"></i> Open ATS Pipeline</span><kbd class="text-[10px] text-slate-400 font-mono">Navigation</kbd></div>`;

        results.innerHTML = html;
      }


      // ================= UTILITIES & EXPORTS =================
      toggleNotifications() {
        document.getElementById('notif-dropdown').classList.toggle('hidden');
      }

      markAllNotifsRead() {
        this.state.notifications.forEach(n => n.unread = false);
        document.getElementById('notif-dot').classList.add('hidden');
        this.renderNotifications();
      }

      renderNotifications() {
        const list = document.getElementById('notif-list');
        list.innerHTML = this.state.notifications.map(n => `
          <div class="p-3 hover:bg-slate-50 dark:hover:bg-obsidian-700 transition cursor-pointer">
            <h5 class="font-bold text-xs text-slate-900 dark:text-white">${n.title}</h5>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${n.msg}</p>
            <span class="text-[9px] font-semibold text-slate-400 mt-1 block">${n.time}</span>
          </div>
        `).join('');
      }

      toggleUserMenu() {
        document.getElementById('user-menu').classList.toggle('hidden');
      }

      toggleMobileNav() {
        document.getElementById('mobile-nav').classList.toggle('hidden');
      }

      openClockInDrawer() {
        document.getElementById('drawer-clockin').classList.remove('hidden');
      }

      closeClockInDrawer() {
        document.getElementById('drawer-clockin').classList.add('hidden');
      }

      toggleClockInState() {
        this.clockedIn = !this.clockedIn;
        const btn = document.getElementById('btn-clockin-toggle');
        if (this.clockedIn) {
          btn.innerText = 'Clock Out';
          btn.className = 'px-5 py-2.5 rounded-2xl bg-heroIndigo-500 hover:bg-heroIndigo-600 text-white font-bold text-xs shadow-lg transition';
          this.showToast('Clocked in successfully', 'success');
        } else {
          btn.innerText = 'Clock In';
          btn.className = 'px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition';
          this.showToast('Clocked out', 'info');
        }
      }

      openAuditDrawer() {
        const container = document.getElementById('audit-logs-container');
        container.innerHTML = this.state.auditLogs.map(a => `
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="flex items-center justify-between text-[10px] font-extrabold text-heroIndigo-600">
              <span>${a.action}</span>
              <span class="text-slate-400">${a.timestamp}</span>
            </div>
            <p class="text-xs font-semibold text-slate-800 mt-1">${a.details}</p>
          </div>
        `).join('');
        document.getElementById('drawer-audit').classList.remove('hidden');
      }

      closeAuditDrawer() {
        document.getElementById('drawer-audit').classList.add('hidden');
      }

      exportEmployeesCSV() {
        const headers = ["ID", "Name", "Email", "Role", "Department", "Work Mode", "Status", "Salary", "Country"];
        const rows = this.state.employees.map(e => [e.id, e.name, e.email, e.role, e.department, e.mode, e.status, e.salary, e.country]);
        
        let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `heroes_employees_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('Downloaded Employees CSV', 'success');
      }

      exportStateJSON() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `heroes_hris_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        this.showToast('Exported full JSON state backup', 'success');
      }

      resetDemoData() {
        this.confirmAction('Reset Demo State', 'This will restore initial baseline data.', () => {
          localStorage.removeItem('heroes_hr_v2_state');
          this.state = INITIAL_STATE;
          this.saveState();
          this.renderAll();
          this.showToast('Demo state reset successfully', 'success');
        });
      }

      setupEventListeners() {
        // Global Keyboard Shortcut Ctrl+K / Cmd+K
        document.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openCommandPalette();
          }
          if (e.key === 'Escape') {
            this.closeCommandPalette();
          }
        });
      }
    }

// Existing HTML controls call the demo controller.
window.app = new HeroesApp();
window.app.init();
