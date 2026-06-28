/* ==========================================================================
   THE FRESHY BEARING - WEB APPLICATION LOGIC (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Data check
    if (typeof STUDENT_DATA === 'undefined') {
        console.error("Student database 'data.js' is missing or not loaded correctly.");
        return;
    }

    // 2. Navigation Control (Menu tabs switcher)
    const tabs = document.querySelectorAll('.menu-tab');
    const sections = document.querySelectorAll('.content-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSection = tab.getAttribute('data-target');
            
            // Switch tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Switch sections
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === targetSection) {
                    sec.classList.add('active');
                }
            });

            // Smooth scroll page back to top
            document.querySelector('.scrapbook-page-content').scrollTop = 0;
        });
    });

    // 3. Schedule Toggler (Freshy Day vs Freshy Night)
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    const scheduleContents = document.querySelectorAll('.schedule-content');

    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSchedule = tab.getAttribute('data-target');
            
            scheduleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            scheduleContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetSchedule) {
                    content.classList.add('active');
                }
            });
        });
    });

    // 4. Faculty mapper utility (used for stats and display)
    function getFacultyByMajor(majorName) {
        const engMajors = [
            "วิศวกรรมคอมพิวเตอร์และสารสนเทศศาสตร์", "วิศวกรรมระบบการผลิตดิจิทัล",
            "วิศวกรรมยานยนต์", "วิศวกรรมหุ่นยนต์และระบบอัตโนมัติ",
            "วิศวกรรมดิจิทัลและอิเล็กทรอนิกส์อัจฉริยะ", "วิศวกรรมอุตสาหการและระบบ",
            "วิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์", "วิศวกรรมเครื่องกลและการออกแบบ", "วิศวกรรมโยธา"
        ];
        const sciMajors = [
            "วิทยาการคอมพิวเตอร์", "วิทยาการและเทคโนโลยีดิจิทัล",
            "วิทยาศาสตร์และเทคโนโลยีสิ่งแวดล้อม", "วิทยาศาสตร์และเทคโนโลยีเคมีประยุกต์",
            "วิทยาการวิเคราะห์ข้อมูลและคณิตศาสตร์ประกันภัย", "ฟิสิกส์"
        ];
        const marMajors = [
            "การขนส่งทางทะเล",
            "วิทยาศาสตร์การเดินเรือ", "วิศวกรรมต่อเรือและวิศวกรรมสมุทรศาสตร์", "วิศวกรรมเครื่องกลเรือ"
        ];
        if (majorName === "เศรษฐศาสตร์") return "คณะเศรษฐศาสตร์";

        const msMajors = [
            "การจัดการโลจิสติกส์",
            "การบัญชี", "การจัดการ", "ธุรกิจระหว่างประเทศ",
            "การตลาดดิจิทัลและการสร้างตรา", "การเงินและการลงทุน",
            "การจัดการอุตสาหกรรมบริการ(แขนงวิชาการจัดการโรงแรมและการเป็นผู้ประกอบการ)",
            "การจัดการอุตสาหกรรมบริการ(แขนงวิชาการจัดการและการเป็นผู้ประกอบการท่องเที่ยว)"
        ];
        
        if (engMajors.includes(majorName)) return "คณะวิศวกรรมศาสตร์ศรีราชา";
        if (sciMajors.includes(majorName)) return "คณะวิทยาศาสตร์ศรีราชา";
        if (marMajors.includes(majorName)) return "คณะพาณิชยนาวีนานาชาติ";
        if (msMajors.includes(majorName)) return "คณะวิทยาการจัดการ";
        return "คณะอื่นๆ";
    }

    // Map stable pre-allocated session/team IDs to display meta
    function getSessionMeta(sessionId) {
        if (sessionId === 0) {
            return {
                name: "กลุ่มเช้า (Morning)",
                regTime: "08.00 - 08.30 น.",
                activityTime: "08.30 - 12.30 น.",
                iconClass: "fa-solid fa-sun"
            };
        } else {
            return {
                name: "กลุ่มบ่าย (Afternoon)",
                regTime: "13.30 - 14.00 น.",
                activityTime: "14.00 - 18.00 น.",
                iconClass: "fa-solid fa-moon"
            };
        }
    }

    function getTeamMeta(teamId) {
        switch(teamId) {
            case 0:
                return {
                    name: "ทิศเหนือ (North)",
                    theme: "nort-theme",
                    color: "var(--color-sci)"
                };
            case 1:
                return {
                    name: "ทิศใต้ (South)",
                    theme: "south-theme",
                    color: "var(--color-mar)"
                };
            case 2:
                return {
                    name: "ทิศอีสาน (ISAN)",
                    theme: "isan-theme",
                    color: "var(--color-eng)"
                };
            case 3:
                return {
                    name: "ทิศกลาง (Central)",
                    theme: "central-theme",
                    color: "var(--color-ms)"
                };
            default:
                return {
                    name: "ทิศเหนือ (North)",
                    theme: "nort-theme",
                    color: "var(--color-sci)"
                };
        }
    }

    // 5. Statistics Calculation
    const totalStudents = STUDENT_DATA.length;
    document.getElementById('stat-total-students').textContent = totalStudents.toLocaleString();

    let morningCount = 0;
    let afternoonCount = 0;
    const teamCounts = [0, 0, 0, 0]; // [Nort, South, ISAN, Central]
    const majorCounts = {};
    let msCount = 0, engCount = 0, sciCount = 0, marCount = 0, ecoCount = 0;
    const teamSessionCounts = [
        [0, 0], // Nort
        [0, 0], // South
        [0, 0], // ISAN
        [0, 0]  // Central
    ];

    STUDENT_DATA.forEach(row => {
        const major = row[4];
        const sessionId = row[6];
        const teamId = row[7];
        const faculty = getFacultyByMajor(major);

        // Faculty count
        if (faculty === "คณะวิทยาการจัดการ") msCount++;
        else if (faculty === "คณะวิศวกรรมศาสตร์ศรีราชา") engCount++;
        else if (faculty === "คณะวิทยาศาสตร์ศรีราชา") sciCount++;
        else if (faculty === "คณะพาณิชยนาวีนานาชาติ") marCount++;
        else if (faculty === "คณะเศรษฐศาสตร์") ecoCount++;

        // Session count
        if (sessionId === 0) morningCount++;
        else afternoonCount++;

        // Team count
        teamCounts[teamId]++;

        // Team/Session count
        teamSessionCounts[teamId][sessionId]++;

        // Major counts
        if (!majorCounts[major]) {
            majorCounts[major] = { count: 0, faculty: faculty };
        }
        majorCounts[major].count++;
    });

    // Dynamically update morning & afternoon counts
    const statMorning = document.getElementById('stat-morning-students');
    if (statMorning) statMorning.textContent = morningCount.toLocaleString();
    const statAfternoon = document.getElementById('stat-afternoon-students');
    if (statAfternoon) statAfternoon.textContent = afternoonCount.toLocaleString();

    // Sort majors by student count descending
    const sortedMajors = Object.entries(majorCounts).sort((a, b) => b[1].count - a[1].count);

    // Populate Majors Table in Dashboard
    const majorsTableBody = document.querySelector('#majors-table tbody');
    majorsTableBody.innerHTML = '';
    sortedMajors.forEach(([majorName, data]) => {
        const percentage = ((data.count / totalStudents) * 100).toFixed(2);
        
        let facShort = data.faculty;
        if (data.faculty === "คณะวิศวกรรมศาสตร์ศรีราชา") facShort = "วิศวกรรมศาสตร์";
        if (data.faculty === "คณะวิทยาศาสตร์ศรีราชา") facShort = "วิทยาศาสตร์";
        if (data.faculty === "คณะพาณิชยนาวีนานาชาติ") facShort = "พาณิชยนาวี";
        if (data.faculty === "คณะวิทยาการจัดการ") facShort = "วิทยาการจัดการ";
        if (data.faculty === "คณะเศรษฐศาสตร์") facShort = "เศรษฐศาสตร์";

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${majorName}</strong></td>
            <td>${facShort}</td>
            <td>${data.count.toLocaleString()} คน</td>
            <td>${percentage}%</td>
        `;
        majorsTableBody.appendChild(row);
    });

    // 6. Chart.js Renderings
    // Chart 1: Faculty Distribution (Doughnut)
    const ctxFaculty = document.getElementById('facultyChart').getContext('2d');
    new Chart(ctxFaculty, {
        type: 'doughnut',
        data: {
            labels: ['วิทยาการจัดการ', 'วิศวกรรมศาสตร์', 'วิทยาศาสตร์', 'พาณิชยนาวี', 'เศรษฐศาสตร์'],
            datasets: [{
                data: [msCount, engCount, sciCount, marCount, ecoCount],
                backgroundColor: ['#d97486', '#cba358', '#568a5c', '#507ea6', '#e28743'],
                borderColor: '#0d0d18',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Bai Jamjuree', size: 11 },
                        color: '#a69b88'
                    }
                }
            }
        }
    });

    // Chart 2: Team/Session Size Distribution (Grouped Bar)
    const ctxPlan = document.getElementById('planChart').getContext('2d');
    new Chart(ctxPlan, {
        type: 'bar',
        data: {
            labels: ['ทิศเหนือ (North)', 'ทิศใต้ (South)', 'ทิศอีสาน (ISAN)', 'ทิศกลาง (Central)'],
            datasets: [
                {
                    label: 'รอบเช้า (Morning)',
                    data: [
                        teamSessionCounts[0][0],
                        teamSessionCounts[1][0],
                        teamSessionCounts[2][0],
                        teamSessionCounts[3][0]
                    ],
                    backgroundColor: '#cba358',
                    borderColor: '#9b7b3c',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'รอบบ่าย (Afternoon)',
                    data: [
                        teamSessionCounts[0][1],
                        teamSessionCounts[1][1],
                        teamSessionCounts[2][1],
                        teamSessionCounts[3][1]
                    ],
                    backgroundColor: '#507ea6',
                    borderColor: '#395e80',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: { family: 'Bai Jamjuree', size: 10 },
                        color: '#a69b88'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { family: 'Bai Jamjuree', size: 10 },
                        color: '#a69b88'
                    },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        font: { family: 'Sarabun', size: 10 },
                        color: '#a69b88'
                    },
                    grid: { color: '#2c251a' }
                }
            }
        }
    });

    // 7. Live Countdown Timer
    const targetDate = new Date("2026-07-02T18:00:00+07:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('countdown-timer').innerHTML = "<div class='time-block' style='min-width: 250px;'><span style='font-size: 1.2rem; padding: 10px;'>ยินดีต้อนรับนิสิตใหม่ KU86 สู่กิจกรรม!</span></div>";
            clearInterval(countdownInterval);
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(d).padStart(2, '0');
        document.getElementById('hours').textContent = String(h).padStart(2, '0');
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    // 8. Search / Checker Functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResultsGrid = document.getElementById('search-results');
    const resultsCountText = document.getElementById('results-count-text');
    const filterChips = document.querySelectorAll('.filter-chip');

    let activeFilter = 'all';

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-faculty');
            runSearch();
        });
    });

    function runSearch() {
        const query = searchInput.value.trim();
        searchResultsGrid.innerHTML = '';

        if (query === '') {
            resultsCountText.textContent = "กรุณากรอกรหัสนิสิต 10 หลักเพื่อค้นหาข้อมูล";
            return;
        }

        // PDPA Privacy Protection:
        // Must be exactly 10 digits numeric student ID.
        const isValidStudentId = /^\d{10}$/.test(query);
        if (!isValidStudentId) {
            resultsCountText.textContent = "กรุณากรอกรหัสนิสิตให้ถูกต้องและครบ 10 หลัก (เช่น 6930XXXXXX)";
            return;
        }

        const filtered = STUDENT_DATA.filter(row => {
            const sid = String(row[0]);
            const major = row[4];
            const faculty = getFacultyByMajor(major);

            // Exact match for student ID only
            const matchesQuery = (sid === query);
            const matchesFilter = activeFilter === 'all' || faculty === activeFilter;

            return matchesQuery && matchesFilter;
        });

        if (filtered.length === 0) {
            resultsCountText.textContent = `ไม่พบผลการค้นหาสำหรับ "${query}"`;
            searchResultsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary); font-family: 'Bai Jamjuree';">ไม่พบข้อมูลกรุณาตรวจสอบการสะกดคำ หรือรหัสนิสิต</div>`;
            return;
        }

        resultsCountText.textContent = `พบรายชื่อทั้งหมด ${filtered.length} คน`;

        filtered.forEach(row => {
            const sid = row[0];
            const prefix = row[1];
            const name = row[2];
            const surname = row[3];
            const major = row[4];
            const faculty = getFacultyByMajor(major);

            let facClass = 'ms';
            if (faculty === "วิศวกรรมศาสตร์ศรีราชา") facClass = 'eng';
            if (faculty === "วิทยาศาสตร์ศรีราชา") facClass = 'sci';
            if (faculty === "พาณิชยนาวีนานาชาติ") facClass = 'mar';
            if (faculty === "คณะเศรษฐศาสตร์") facClass = 'eco';

            const card = document.createElement('div');
            card.className = 'student-result-card';
            card.innerHTML = `
                <span class="src-id">${sid}</span>
                <span class="src-name">${prefix}${name} ${surname}</span>
                <div class="src-meta">
                    <span><span class="faculty-badge-inline ${facClass}"></span>${faculty}</span>
                    <span>สาขา: ${major}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                showTicket(row);
            });

            searchResultsGrid.appendChild(card);
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', runSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') runSearch();
        });
    }

    // 9. Ticket Modal Dialog Controls
    const modal = document.getElementById('student-modal');
    const modalClose = document.getElementById('modal-close');
    const ticketPlaceholder = document.getElementById('modal-ticket-placeholder');

    function showTicket(row) {
        const sid = row[0];
        const prefix = row[1];
        const name = row[2];
        const surname = row[3];
        const major = row[4];
        const plan = row[5];
        const sessionId = row[6];
        const teamId = row[7];
        
        const faculty = getFacultyByMajor(major);
        const sessionMeta = getSessionMeta(sessionId);
        const teamMeta = getTeamMeta(teamId);

        ticketPlaceholder.innerHTML = `
            <div class="freshy-ticket ${teamMeta.theme}" data-id="${sid}" data-name="${prefix}${name}_${surname}">
                <!-- Header strip -->
                <div class="ticket-header-strip">
                    <h3>THE FRESHY BEARING PASS</h3>
                    <span>KU 86</span>
                </div>

                <!-- Notches and ticket body -->
                <div class="ticket-notch top"></div>
                <div class="ticket-notch bottom"></div>
                
                <div class="ticket-body">
                    <!-- Left Main Stub -->
                    <div class="ticket-main">
                        <div class="ticket-field student-id-field">
                            <label>รหัสนิสิต (STUDENT ID)</label>
                            <span>${sid}</span>
                        </div>
                        
                        <div class="ticket-main-grid">
                            <div class="ticket-field full-width">
                                <label>ชื่อ - นามสกุล (NAME - SURNAME)</label>
                                <span>${prefix}${name} ${surname}</span>
                            </div>
                            
                            <div class="ticket-field">
                                <label>คณะที่สังกัด (FACULTY)</label>
                                <span>${faculty}</span>
                            </div>
                            
                            <div class="ticket-field">
                                <label>หลักสูตร (STUDY PLAN)</label>
                                <span>${plan}</span>
                            </div>
                            
                            <div class="ticket-field full-width">
                                <label>สาขาวิชา (MAJOR)</label>
                                <span>${major}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Ticket Stub -->
                    <div class="ticket-stub">
                        <div class="stub-group-badge">
                            <i class="${sessionMeta.iconClass}"></i>
                            <h4>${sessionMeta.name}</h4>
                            <span>กลุ่มเวลาสุ่มรอบเข้างาน</span>
                        </div>
                        <div class="stub-time">${sessionMeta.regTime}</div>
                        <div style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 12px; font-family: Sarabun;">
                            (โปรดลงทะเบียนตามรอบสิทธิ์สุ่ม)
                        </div>
                        <div class="stub-team-badge">${teamMeta.name}</div>
                    </div>
                </div>

                <!-- Compass watermark background -->
                <div class="ticket-watermark"></div>
            </div>
        `;

        modal.classList.add('active');
    }

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // 10. Download Ticket as Image (PNG) or Document (PDF)
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadPdf = document.getElementById('btn-download-pdf');

    function downloadTicket(format, button) {
        const ticketElement = document.querySelector('#modal-ticket-placeholder .freshy-ticket');
        if (!ticketElement) return;

        // Show loading state
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังประมวลผล...';
        button.disabled = true;

        // Check if running on file:// protocol (local HTML file)
        if (window.location.protocol === 'file:') {
            alert('ไม่สามารถดาวน์โหลดป้ายชื่อได้เนื่องจากเบราว์เซอร์บล็อกการบันทึกภาพจากไฟล์ออฟไลน์ (file://)\n\nกรุณาใช้งานผ่านลิงก์ออนไลน์ หรือเปิดผ่าน Web Server ท้องถิ่นแทนครับ');
            button.innerHTML = originalContent;
            button.disabled = false;
            return;
        }

        // Brief delay to allow loader spinner UI to render
        setTimeout(() => {
            html2canvas(ticketElement, {
                scale: 3,             // 3x higher resolution to fix blurry/pixelated images
                useCORS: true,        // Allow CORS resources
                logging: true,        // Enable debugging logs in browser console
                backgroundColor: null  // Transparent background around borders
            }).then(canvas => {
                const id = ticketElement.getAttribute('data-id') || 'ticket';
                const name = ticketElement.getAttribute('data-name') || 'freshy';

                try {
                    if (format === 'png') {
                        const imgData = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.download = `ticket_${id}_${name}.png`;
                        link.href = imgData;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else if (format === 'pdf') {
                        if (!window.jspdf || !window.jspdf.jsPDF) {
                            throw new Error('ไม่พบไลบรารี jsPDF กรุณารอให้หน้าเว็บโหลดเสร็จสมบูรณ์ หรือรีเฟรชหน้าเว็บ');
                        }
                        const { jsPDF } = window.jspdf;
                        
                        // Set PDF dimensions to perfectly match the rendered canvas
                        const pdf = new jsPDF({
                            orientation: 'landscape',
                            unit: 'px',
                            format: [canvas.width, canvas.height]
                        });
                        
                        const imgData = canvas.toDataURL('image/png');
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                        pdf.save(`ticket_${id}_${name}.pdf`);
                    }

                    // Reset button state
                    button.innerHTML = originalContent;
                    button.disabled = false;
                } catch (exportErr) {
                    console.error('Export format error:', exportErr);
                    alert('ไม่สามารถดาวน์โหลดไฟล์ได้\n(ข้อผิดพลาดในการแปลงไฟล์: ' + (exportErr.message || exportErr) + ')');
                    button.innerHTML = originalContent;
                    button.disabled = false;
                }
            }).catch(err => {
                console.error('html2canvas error:', err);
                const errMsg = err && err.message ? err.message : String(err);
                alert('ไม่สามารถบันทึกไฟล์ได้ กรุณาลองแคปหน้าจอแทน\n(ข้อผิดพลาดในการสร้างภาพ: ' + errMsg + ')');
                button.innerHTML = originalContent;
                button.disabled = false;
            });
        }, 100);
    }

    if (btnDownloadPng) {
        btnDownloadPng.addEventListener('click', () => downloadTicket('png', btnDownloadPng));
    }

    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', () => downloadTicket('pdf', btnDownloadPdf));
    }

    // Staff Search / Checker Functionality
    const staffSearchInput = document.getElementById('staff-search-input');
    const staffSearchBtn = document.getElementById('staff-search-btn');
    const staffSearchResultsGrid = document.getElementById('staff-search-results');
    const staffResultsCountText = document.getElementById('staff-results-count-text');

    // Dynamic initial count setup
    if (staffResultsCountText && typeof STAFF_DATA !== 'undefined') {
        const staffCount = STAFF_DATA.filter(r => r.role === 'staff').length;
        const subcommCount = STAFF_DATA.filter(r => r.role === 'subcommittee').length;
        staffResultsCountText.textContent = `พร้อมค้นหารายชื่อจากฐานข้อมูลสตาฟ ${staffCount} คน และอนุกรรมการ ${subcommCount} คน`;
    }

    function runStaffSearch() {
        if (typeof STAFF_DATA === 'undefined') {
            console.error("Staff database is missing.");
            return;
        }
        const query = staffSearchInput.value.trim().toUpperCase();
        staffSearchResultsGrid.innerHTML = '';

        if (query === '') {
            const staffCount = STAFF_DATA.filter(r => r.role === 'staff').length;
            const subcommCount = STAFF_DATA.filter(r => r.role === 'subcommittee').length;
            staffResultsCountText.textContent = `พร้อมค้นหารายชื่อจากฐานข้อมูลสตาฟ ${staffCount} คน และอนุกรรมการ ${subcommCount} คน`;
            return;
        }

        // PDPA Privacy Protection:
        // Must be exactly 10 digits numeric student ID OR a custom search code from STAFF_DATA
        const isCustomCode = STAFF_DATA.some(row => row.id.toUpperCase() === query && !/^\d{10}$/.test(row.id));
        const isValidId = /^\d{10}$/.test(query) || isCustomCode;
        if (!isValidId) {
            staffResultsCountText.textContent = "กรุณากรอกรหัสนิสิตให้ถูกต้องและครบ 10 หลัก (เช่น 6630XXXXXX)";
            return;
        }

        const filtered = STAFF_DATA.filter(row => {
            const sid = String(row.id).toUpperCase();
            // Exact match for student ID or custom search code
            return sid === query;
        });

        if (filtered.length === 0) {
            staffResultsCountText.textContent = `ไม่พบผลการค้นหาสำหรับ "${query}"`;
            staffSearchResultsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary); font-family: 'Bai Jamjuree';">ไม่พบข้อมูลกรุณาตรวจสอบการสะกดคำ หรือรหัสนิสิต</div>`;
            return;
        }

        staffResultsCountText.textContent = `พบรายชื่อทั้งหมด ${filtered.length} คน`;

        filtered.forEach(row => {
            const card = document.createElement('div');
            card.className = 'student-result-card';
            
            const displayName = row.nickname ? 
                `${row.prefix}${row.name} ${row.surname} (${row.nickname})` : 
                `${row.prefix}${row.name} ${row.surname}`;
                
            const roleLabel = row.role === 'subcommittee' ? 'สตาฟ (อนุกรรมการ)' : 'สตาฟ (STAFF)';
            const roleIcon = 'fa-solid fa-id-card';

            card.innerHTML = `
                <span class="src-id">${row.id}</span>
                <span class="src-name">${displayName}</span>
                <div class="src-meta">
                    <span><i class="${roleIcon}" style="margin-right: 5px; color: var(--color-gold);"></i>${roleLabel}</span>
                    <span>ตำแหน่ง: ${row.position}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                showStaffTicket(row);
            });

            staffSearchResultsGrid.appendChild(card);
        });
    }

    if (staffSearchBtn && staffSearchInput) {
        staffSearchBtn.addEventListener('click', runStaffSearch);
        staffSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') runStaffSearch();
        });
    }

    function showStaffTicket(row) {
        const isSubcomm = row.role === 'subcommittee';
        const isAdvisor = row.position.includes('ที่ปรึกษา') || row.id === 'SAB69';
        const roleHeader = isAdvisor ? 'SPECIAL PASS' : 'STAFF';
        const stubHeader = isAdvisor ? 'VIP' : 'STAFF';
        const stubSubtitle = (isSubcomm || isAdvisor) ? row.position : 'ฝ่ายงานผู้ดูแลระบบ';
        const teamBadgeLabel = isAdvisor ? 'ที่ปรึกษาโครงการ' : 'ทีมสตาฟ';
        const stubIcon = 'fa-solid fa-id-badge';

        ticketPlaceholder.innerHTML = `
            <div class="freshy-ticket staff-theme" data-id="${row.id}" data-name="${row.prefix}${row.name}_${row.surname}">
                <!-- Header strip -->
                <div class="ticket-header-strip">
                    <h3>THE FRESHY BEARING PASS</h3>
                    <span>${roleHeader}</span>
                </div>

                <!-- Notches and ticket body -->
                <div class="ticket-notch top"></div>
                <div class="ticket-notch bottom"></div>
                
                <div class="ticket-body">
                    <!-- Left Main Stub -->
                    <div class="ticket-main">
                        <div class="ticket-field student-id-field">
                            <label>${isAdvisor ? 'รหัสค้นหา (SEARCH CODE)' : 'รหัสนิสิต (STUDENT ID)'}</label>
                            <span>${row.id}</span>
                        </div>
                        
                        <div class="ticket-main-grid">
                            <div class="ticket-field">
                                <label>ชื่อ - นามสกุล (NAME - SURNAME)</label>
                                <span>${row.prefix}${row.name} ${row.surname}</span>
                            </div>
                            
                            <div class="ticket-field">
                                <label>ชื่อเล่น (NICKNAME)</label>
                                <span>${row.nickname || '-'}</span>
                            </div>
                            
                            <div class="ticket-field full-width">
                                <label>ตำแหน่ง (POSITION)</label>
                                <span>${row.position}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Ticket Stub -->
                    <div class="ticket-stub">
                        <div class="stub-group-badge">
                            <i class="${stubIcon}"></i>
                            <h4>${stubHeader}</h4>
                            <span>${stubSubtitle}</span>
                        </div>
                        <div class="stub-team-badge" style="background-color: rgba(203,163,88,0.15); color: var(--color-gold-light); border-color: var(--color-gold-light);">
                            ${teamBadgeLabel}
                        </div>
                    </div>
                </div>

                <!-- Compass watermark background -->
                <div class="ticket-watermark"></div>
            </div>
        `;
        modal.classList.add('active');
    }

    // ----------------------------------------------------
    // 6. Admin Panel (Password Locked Master Student List)
    // ----------------------------------------------------
    const ADMIN_PASSWORD = "sabsab1234";
    let isAdminUnlocked = sessionStorage.getItem('isAdminUnlocked') === 'true';
    let adminFilteredData = [];
    let adminCurrentPage = 1;
    const adminPageSize = 50;

    const adminLockScreen = document.getElementById('admin-lock-screen');
    const adminDashboardContent = document.getElementById('admin-dashboard-content');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const togglePasswordBtn = document.getElementById('toggle-password-visibility');
    const btnUnlockAdmin = document.getElementById('btn-unlock-admin');
    const adminLoginError = document.getElementById('admin-login-error');

    const adminSearchInput = document.getElementById('admin-search-input');
    const adminFilterFaculty = document.getElementById('admin-filter-faculty');
    const adminFilterDirection = document.getElementById('admin-filter-direction');
    const adminFilterSession = document.getElementById('admin-filter-session');
    const adminTotalFiltered = document.getElementById('admin-total-filtered');
    const adminPaginationInfo = document.getElementById('admin-pagination-info');
    const adminFilterUserType = document.getElementById('admin-filter-usertype');
    let isAdminListenersAttached = false;

    // Init state check
    if (isAdminUnlocked) {
        unlockAdminPanel();
    }

    // Toggle password eye icon
    if (togglePasswordBtn && adminPasswordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const currentType = adminPasswordInput.getAttribute('type');
            const targetType = currentType === 'password' ? 'text' : 'password';
            adminPasswordInput.setAttribute('type', targetType);
            
            const eyeIcon = togglePasswordBtn.querySelector('i');
            if (targetType === 'password') {
                eyeIcon.className = 'fa-solid fa-eye';
            } else {
                eyeIcon.className = 'fa-solid fa-eye-slash';
            }
        });
    }

    // Handle password unlock click/enter
    if (btnUnlockAdmin && adminPasswordInput) {
        btnUnlockAdmin.addEventListener('click', attemptUnlock);
        adminPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                attemptUnlock();
            }
        });
    }

    function attemptUnlock() {
        const enteredPassword = adminPasswordInput.value;
        if (enteredPassword === ADMIN_PASSWORD) {
            // Success animation
            adminLoginError.style.display = 'none';
            const lockedIcon = document.querySelector('.lock-locked');
            const unlockedIcon = document.querySelector('.lock-unlocked');
            if (lockedIcon && unlockedIcon) {
                lockedIcon.style.display = 'none';
                unlockedIcon.style.display = 'inline-block';
            }
            
            sessionStorage.setItem('isAdminUnlocked', 'true');
            isAdminUnlocked = true;
            
            // Short delay for animation effect
            setTimeout(() => {
                unlockAdminPanel();
            }, 400);
        } else {
            // Failure animation
            adminLoginError.style.display = 'block';
            adminPasswordInput.classList.remove('error-shake');
            // Force browser reflow to restart css animation
            void adminPasswordInput.offsetWidth; 
            adminPasswordInput.classList.add('error-shake');
            
            adminPasswordInput.style.borderColor = '#d9534f';
            setTimeout(() => {
                adminPasswordInput.style.borderColor = '';
                adminPasswordInput.classList.remove('error-shake');
            }, 1000);
        }
    }

    function unlockAdminPanel() {
        if (adminLockScreen) adminLockScreen.style.display = 'none';
        if (adminDashboardContent) adminDashboardContent.style.display = 'block';
        
        // Load initial data
        adminFilteredData = [...STUDENT_DATA];
        applyAdminFilters();
        
        // Setup dashboard event listeners (once only)
        if (!isAdminListenersAttached) {
            if (adminSearchInput) adminSearchInput.addEventListener('input', applyAdminFilters);
            if (adminFilterUserType) {
                adminFilterUserType.addEventListener('change', () => {
                    const selectedType = adminFilterUserType.value;
                    if (selectedType === 'staff') {
                        if (adminFilterFaculty) adminFilterFaculty.disabled = true;
                        if (adminFilterDirection) adminFilterDirection.disabled = true;
                        if (adminFilterSession) adminFilterSession.disabled = true;
                    } else {
                        if (adminFilterFaculty) adminFilterFaculty.disabled = false;
                        if (adminFilterDirection) adminFilterDirection.disabled = false;
                        if (adminFilterSession) adminFilterSession.disabled = false;
                    }
                    applyAdminFilters();
                });
            }
            if (adminFilterFaculty) adminFilterFaculty.addEventListener('change', applyAdminFilters);
            if (adminFilterDirection) adminFilterDirection.addEventListener('change', applyAdminFilters);
            if (adminFilterSession) adminFilterSession.addEventListener('change', applyAdminFilters);
            
            const btnAdminPrev = document.getElementById('btn-admin-prev');
            const btnAdminNext = document.getElementById('btn-admin-next');

            if (btnAdminPrev) {
                btnAdminPrev.addEventListener('click', () => {
                    if (adminCurrentPage > 1) {
                        adminCurrentPage--;
                        renderAdminTable();
                    }
                });
            }
            
            if (btnAdminNext) {
                btnAdminNext.addEventListener('click', () => {
                    if (adminCurrentPage * adminPageSize < adminFilteredData.length) {
                        adminCurrentPage++;
                        renderAdminTable();
                    }
                });
            }
            
            isAdminListenersAttached = true;
        }
    }

    function applyAdminFilters() {
        const userType = adminFilterUserType ? adminFilterUserType.value : 'student';
        const searchQuery = adminSearchInput ? adminSearchInput.value.trim().toLowerCase() : '';
        
        if (userType === 'staff') {
            if (typeof STAFF_DATA === 'undefined') {
                adminFilteredData = [];
            } else {
                adminFilteredData = STAFF_DATA.filter(row => {
                    if (searchQuery === '') return true;
                    const sid = row.id.toString();
                    const fullName = (row.prefix + row.name + " " + row.surname).toLowerCase();
                    const nickname = (row.nickname || '').toLowerCase();
                    return sid.includes(searchQuery) || 
                           fullName.includes(searchQuery) || 
                           row.position.toLowerCase().includes(searchQuery) ||
                           nickname.includes(searchQuery);
                });
            }
        } else {
            const selectedFaculty = adminFilterFaculty ? adminFilterFaculty.value : 'all';
            const selectedDirection = adminFilterDirection ? adminFilterDirection.value : 'all';
            const selectedSession = adminFilterSession ? adminFilterSession.value : 'all';
            
            adminFilteredData = STUDENT_DATA.filter(row => {
                // 1. Search Query filter
                let matchesSearch = true;
                if (searchQuery !== '') {
                    const sid = row[0].toString();
                    const fullName = (row[1] + row[2] + " " + row[3]).toLowerCase();
                    matchesSearch = sid.includes(searchQuery) || fullName.includes(searchQuery);
                }
                
                // 2. Faculty filter
                let matchesFaculty = true;
                if (selectedFaculty !== 'all') {
                    const faculty = getFacultyByMajor(row[4]);
                    matchesFaculty = faculty === selectedFaculty;
                }
                
                // 3. Direction (Team) filter
                let matchesDirection = true;
                if (selectedDirection !== 'all') {
                    const teamId = row[7].toString();
                    matchesDirection = teamId === selectedDirection;
                }
                
                // 4. Session filter
                let matchesSession = true;
                if (selectedSession !== 'all') {
                    const sessionId = row[6].toString();
                    matchesSession = sessionId === selectedSession;
                }
                
                return matchesSearch && matchesFaculty && matchesDirection && matchesSession;
            });
        }
        
        adminCurrentPage = 1;
        renderAdminTable();
    }

    function renderAdminTable() {
        const currentTableBody = document.querySelector('#admin-students-table tbody');
        if (!currentTableBody) return;
        currentTableBody.innerHTML = '';
        
        const total = adminFilteredData.length;
        if (adminTotalFiltered) {
            adminTotalFiltered.textContent = total.toLocaleString();
        }
        
        const currentBtnPrev = document.getElementById('btn-admin-prev');
        const currentBtnNext = document.getElementById('btn-admin-next');
        const currentPaginationInfo = document.getElementById('admin-pagination-info');
        
        // Dynamically update table headers based on user type
        const userType = adminFilterUserType ? adminFilterUserType.value : 'student';
        const thead = document.querySelector('#admin-students-table thead');
        if (thead) {
            if (userType === 'staff') {
                thead.innerHTML = `
                    <tr>
                        <th>ลำดับ</th>
                        <th>รหัสนิสิต</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ชื่อเล่น</th>
                        <th>ประเภท</th>
                        <th colspan="2">ตำแหน่ง/ฝ่าย</th>
                    </tr>
                `;
            } else {
                thead.innerHTML = `
                    <tr>
                        <th>ลำดับ</th>
                        <th>รหัสนิสิต</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>คณะวิชา</th>
                        <th>สาขาวิชา</th>
                        <th>กลุ่มทิศทาง</th>
                        <th>รอบกิจกรรม</th>
                    </tr>
                `;
            }
        }
        
        if (total === 0) {
            currentTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-secondary);">ไม่พบข้อมูลที่ตรงตามเงื่อนไขค้นหา</td></tr>`;
            if (currentPaginationInfo) currentPaginationInfo.textContent = 'แสดงผล 0-0 จาก 0 รายการ';
            if (currentBtnPrev) currentBtnPrev.disabled = true;
            if (currentBtnNext) currentBtnNext.disabled = true;
            return;
        }
        
        const start = (adminCurrentPage - 1) * adminPageSize;
        const end = Math.min(start + adminPageSize, total);
        const pageData = adminFilteredData.slice(start, end);
        
        // Define team names and badges
        const teamBadges = [
            '<span class="direction-badge-table badge-north">ทิศเหนือ (North)</span>',
            '<span class="direction-badge-table badge-south">ทิศใต้ (South)</span>',
            '<span class="direction-badge-table badge-isan">ทิศอีสาน (ISAN)</span>',
            '<span class="direction-badge-table badge-central">ทิศกลาง (Central)</span>'
        ];
        
        const sessionBadges = [
            '<span class="session-badge-table badge-morning"><i class="fa-solid fa-sun"></i> รอบเช้า</span>',
            '<span class="session-badge-table badge-afternoon"><i class="fa-solid fa-moon"></i> รอบบ่าย</span>'
        ];
        
        pageData.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const index = start + idx + 1;
            
            if (userType === 'staff') {
                const sid = row.id;
                const name = row.prefix + row.name + " " + row.surname;
                const nick = row.nickname || "-";
                const typeLabel = row.role === 'subcommittee' ? '<span class="admin-type-badge subcomm-badge">สตาฟ (อนุกรรมการ)</span>' : '<span class="admin-type-badge staff-badge">สตาฟ (หลัก)</span>';
                const position = row.position;
                
                tr.innerHTML = `
                    <td>${index.toLocaleString()}</td>
                    <td style="font-weight: 600; font-family: monospace; font-size: 0.9rem;">${sid}</td>
                    <td>${name}</td>
                    <td>${nick}</td>
                    <td>${typeLabel}</td>
                    <td colspan="2" style="font-weight: 600; color: var(--color-gold-dark);">${position}</td>
                `;

                tr.addEventListener('click', () => {
                    showStaffTicket(row);
                });
            } else {
                const sid = row[0];
                const name = row[1] + row[2] + " " + row[3];
                const major = row[4];
                const faculty = getFacultyByMajor(major);
                const teamBadge = teamBadges[row[7]] || '-';
                const sessionBadge = sessionBadges[row[6]] || '-';
                
                tr.innerHTML = `
                    <td>${index.toLocaleString()}</td>
                    <td style="font-weight: 600; font-family: monospace; font-size: 0.9rem;">${sid}</td>
                    <td>${name}</td>
                    <td>${faculty}</td>
                    <td>${major}</td>
                    <td>${teamBadge}</td>
                    <td>${sessionBadge}</td>
                `;

                tr.addEventListener('click', () => {
                    showTicket(row);
                });
            }
            currentTableBody.appendChild(tr);
        });
        
        // Update pagination info
        if (currentPaginationInfo) {
            currentPaginationInfo.textContent = `แสดงผล ${(start + 1).toLocaleString()} - ${end.toLocaleString()} จาก ${total.toLocaleString()} รายการ`;
        }
        
        // Update button disabled state
        if (currentBtnPrev) currentBtnPrev.disabled = adminCurrentPage === 1;
        if (currentBtnNext) currentBtnNext.disabled = end >= total;
    }

});
