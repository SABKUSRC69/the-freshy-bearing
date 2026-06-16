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
        
        if (engMajors.includes(majorName)) return "วิศวกรรมศาสตร์ศรีราชา";
        if (sciMajors.includes(majorName)) return "วิทยาศาสตร์ศรีราชา";
        if (marMajors.includes(majorName)) return "พาณิชยนาวีนานาชาติ";
        if (msMajors.includes(majorName)) return "วิทยาการจัดการ";
        return "อื่นๆ";
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
                    name: "ทิศเหนือ (Nort)",
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
                    name: "ทิศเหนือ (Nort)",
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
        if (faculty === "วิทยาการจัดการ") msCount++;
        else if (faculty === "วิศวกรรมศาสตร์ศรีราชา") engCount++;
        else if (faculty === "วิทยาศาสตร์ศรีราชา") sciCount++;
        else if (faculty === "พาณิชยนาวีนานาชาติ") marCount++;
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

    // Sort majors by student count descending
    const sortedMajors = Object.entries(majorCounts).sort((a, b) => b[1].count - a[1].count);

    // Populate Majors Table in Dashboard
    const majorsTableBody = document.querySelector('#majors-table tbody');
    majorsTableBody.innerHTML = '';
    sortedMajors.forEach(([majorName, data]) => {
        const percentage = ((data.count / totalStudents) * 100).toFixed(2);
        
        let facShort = data.faculty;
        if (data.faculty === "วิศวกรรมศาสตร์ศรีราชา") facShort = "วิศวกรรมศาสตร์";
        if (data.faculty === "วิทยาศาสตร์ศรีราชา") facShort = "วิทยาศาสตร์";
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
                borderColor: '#fdfcf9',
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
                        color: '#6e624c'
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
            labels: ['ทิศเหนือ (Nort)', 'ทิศใต้ (South)', 'ทิศอีสาน (ISAN)', 'ทิศกลาง (Central)'],
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
                    backgroundColor: '#3c3222',
                    borderColor: '#272016',
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
                        color: '#6e624c'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { family: 'Bai Jamjuree', size: 10 },
                        color: '#6e624c'
                    },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        font: { family: 'Sarabun', size: 10 },
                        color: '#6e624c'
                    },
                    grid: { color: '#efeae0' }
                }
            }
        }
    });

    // 7. Live Countdown Timer
    const targetDate = new Date("2026-06-27T09:00:00+07:00").getTime();

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
        const query = searchInput.value.trim().toLowerCase();
        searchResultsGrid.innerHTML = '';

        if (query === '') {
            resultsCountText.textContent = "กรุณากรอกรหัสนิสิต 10 หลัก หรือชื่อ-นามสกุล เพื่อค้นหาข้อมูล";
            return;
        }

        // PDPA Privacy Protection:
        // 1. If query is numeric (student ID), it must be exactly 10 digits.
        const isNumeric = /^\d+$/.test(query);
        if (isNumeric && query.length !== 10) {
            resultsCountText.textContent = "กรุณากรอกรหัสนิสิตให้ครบ 10 หลัก (เช่น 6930100013)";
            return;
        }

        // 2. If query is text (name/surname), it must be at least 3 characters long.
        if (!isNumeric && query.length < 3) {
            resultsCountText.textContent = "กรุณากรอกชื่อหรือนามสกุลอย่างน้อย 3 ตัวอักษรเพื่อค้นหา";
            return;
        }

        const filtered = STUDENT_DATA.filter(row => {
            const sid = String(row[0]);
            const fullName = (row[2] + " " + row[3]).toLowerCase();
            const major = row[4];
            const faculty = getFacultyByMajor(major);

            // Exact match for student ID, substring match for name
            const matchesQuery = (isNumeric && sid === query) || (!isNumeric && (row[2].toLowerCase().includes(query) || row[3].toLowerCase().includes(query)));
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

    searchBtn.addEventListener('click', runSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') runSearch();
    });

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
            <div class="freshy-ticket ${teamMeta.theme}">
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

});
