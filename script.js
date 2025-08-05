// Steel BOM Calculator - Main Application
class SteelBOMCalculator {
    constructor() {
        this.standardSections = [];
        this.iGirders = [];
        this.boxGirders = [];
        this.defaultSteelRate = 65.00; // ₹65.00 per kg (₹65,000 per ton)
        this.initializeEventListeners();
        this.loadSectionData();
        this.setCurrentDate();
        
        // Initialize calculated web heights
        this.calculateIWebHeight();
        this.calculateBoxWebHeight();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // Summary tab switching
        document.querySelectorAll('.summary-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSummaryTab(e));
        });

        // Section type change
        document.getElementById('sectionType').addEventListener('change', (e) => {
            this.updateSectionSizes(e.target.value);
        });

        // I-Section girder input change listeners for real-time calculation
        document.getElementById('totalDepth').addEventListener('input', () => this.calculateIWebHeight());
        document.getElementById('flangeThickness').addEventListener('input', () => this.calculateIWebHeight());

        // Box section girder input change listeners for real-time calculation
        document.getElementById('boxTotalDepth').addEventListener('input', () => this.calculateBoxWebHeight());
        document.getElementById('boxFlangeThickness').addEventListener('input', () => this.calculateBoxWebHeight());

        // Steel rate change listener
        document.getElementById('steelRate').addEventListener('input', () => this.updateTotalSummary());

        // Add buttons
        document.getElementById('addStandardSection').addEventListener('click', () => {
            this.addStandardSection();
        });

        document.getElementById('addIGirder').addEventListener('click', () => {
            this.addIGirder();
        });

        document.getElementById('addBoxGirder').addEventListener('click', () => {
            this.addBoxGirder();
        });

        // Action buttons
        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('exportExcel').addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('printBOM').addEventListener('click', () => {
            this.printBOM();
        });
    }

    // Set current date
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('projectDate').value = today;
    }

    // Switch between main tabs
    switchTab(e) {
        const targetTab = e.target.dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(targetTab).classList.add('active');
    }

    // Switch between summary tabs
    switchSummaryTab(e) {
        const targetSummary = e.target.dataset.summary;
        
        // Update summary tab buttons
        document.querySelectorAll('.summary-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update summary content
        document.querySelectorAll('.summary-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${targetSummary}-summary`).classList.add('active');
    }

    // Load IS SP 6-1 section data
    loadSectionData() {
        this.sectionDatabase = {
            'ISMB': {
                'ISMB 75': { weight: 7.5, depth: 75, width: 40 },
                'ISMB 100': { weight: 11.5, depth: 100, width: 50 },
                'ISMB 125': { weight: 13.4, depth: 125, width: 65 },
                'ISMB 150': { weight: 16.0, depth: 150, width: 75 },
                'ISMB 175': { weight: 19.6, depth: 175, width: 85 },
                'ISMB 200': { weight: 25.4, depth: 200, width: 100 },
                'ISMB 225': { weight: 31.1, depth: 225, width: 110 },
                'ISMB 250': { weight: 37.3, depth: 250, width: 125 },
                'ISMB 300': { weight: 46.0, depth: 300, width: 140 },
                'ISMB 350': { weight: 52.4, depth: 350, width: 140 },
                'ISMB 400': { weight: 61.5, depth: 400, width: 140 },
                'ISMB 450': { weight: 72.4, depth: 450, width: 150 },
                'ISMB 500': { weight: 86.9, depth: 500, width: 180 },
                'ISMB 550': { weight: 103.7, depth: 550, width: 190 },
                'ISMB 600': { weight: 123.0, depth: 600, width: 210 }
            },
            'ISJB': {
                'ISJB 100': { weight: 8.0, depth: 100, width: 50 },
                'ISJB 125': { weight: 10.2, depth: 125, width: 65 },
                'ISJB 150': { weight: 12.1, depth: 150, width: 75 },
                'ISJB 175': { weight: 14.9, depth: 175, width: 85 },
                'ISJB 200': { weight: 18.9, depth: 200, width: 100 },
                'ISJB 225': { weight: 23.6, depth: 225, width: 110 },
                'ISJB 250': { weight: 28.2, depth: 250, width: 125 },
                'ISJB 300': { weight: 34.2, depth: 300, width: 140 },
                'ISJB 350': { weight: 39.7, depth: 350, width: 140 },
                'ISJB 400': { weight: 46.0, depth: 400, width: 140 }
            },
            'ISLB': {
                'ISLB 75': { weight: 6.1, depth: 75, width: 40 },
                'ISLB 100': { weight: 8.0, depth: 100, width: 50 },
                'ISLB 125': { weight: 9.2, depth: 125, width: 65 },
                'ISLB 150': { weight: 11.0, depth: 150, width: 75 },
                'ISLB 175': { weight: 13.1, depth: 175, width: 85 },
                'ISLB 200': { weight: 16.9, depth: 200, width: 100 },
                'ISLB 225': { weight: 20.2, depth: 225, width: 110 },
                'ISLB 250': { weight: 24.2, depth: 250, width: 125 },
                'ISLB 300': { weight: 28.5, depth: 300, width: 140 },
                'ISLB 350': { weight: 33.0, depth: 350, width: 140 },
                'ISLB 400': { weight: 38.0, depth: 400, width: 140 }
            },
            'ISWB': {
                'ISWB 150': { weight: 24.0, depth: 150, width: 150 },
                'ISWB 200': { weight: 42.0, depth: 200, width: 200 },
                'ISWB 250': { weight: 72.0, depth: 250, width: 250 },
                'ISWB 300': { weight: 94.0, depth: 300, width: 300 },
                'ISWB 350': { weight: 137.0, depth: 350, width: 350 },
                'ISWB 400': { weight: 179.0, depth: 400, width: 400 },
                'ISWB 450': { weight: 230.0, depth: 450, width: 450 },
                'ISWB 500': { weight: 290.0, depth: 500, width: 500 }
            },
            'ISHP': {
                'ISHP 150': { weight: 29.0, depth: 150, width: 150 },
                'ISHP 200': { weight: 49.0, depth: 200, width: 200 },
                'ISHP 250': { weight: 79.0, depth: 250, width: 250 },
                'ISHP 300': { weight: 103.0, depth: 300, width: 300 },
                'ISHP 350': { weight: 146.0, depth: 350, width: 350 },
                'ISHP 400': { weight: 188.0, depth: 400, width: 400 },
                'ISHP 450': { weight: 239.0, depth: 450, width: 450 },
                'ISHP 500': { weight: 299.0, depth: 500, width: 500 }
            },
            'ISMC': {
                'ISMC 75': { weight: 7.1, depth: 75, width: 40 },
                'ISMC 100': { weight: 9.6, depth: 100, width: 50 },
                'ISMC 125': { weight: 13.1, depth: 125, width: 65 },
                'ISMC 150': { weight: 16.8, depth: 150, width: 75 },
                'ISMC 175': { weight: 19.6, depth: 175, width: 85 },
                'ISMC 200': { weight: 22.3, depth: 200, width: 75 },
                'ISMC 250': { weight: 29.8, depth: 250, width: 80 },
                'ISMC 300': { weight: 36.3, depth: 300, width: 90 },
                'ISMC 350': { weight: 43.0, depth: 350, width: 100 },
                'ISMC 400': { weight: 50.1, depth: 400, width: 100 }
            },
            'ISLC': {
                'ISLC 75': { weight: 6.1, depth: 75, width: 40 },
                'ISLC 100': { weight: 8.1, depth: 100, width: 50 },
                'ISLC 125': { weight: 10.2, depth: 125, width: 65 },
                'ISLC 150': { weight: 12.8, depth: 150, width: 75 },
                'ISLC 175': { weight: 15.3, depth: 175, width: 85 },
                'ISLC 200': { weight: 17.4, depth: 200, width: 75 },
                'ISLC 250': { weight: 22.1, depth: 250, width: 80 },
                'ISLC 300': { weight: 26.0, depth: 300, width: 90 },
                'ISLC 350': { weight: 30.0, depth: 350, width: 100 },
                'ISLC 400': { weight: 34.0, depth: 400, width: 100 }
            },
            'ISA': {
                '20 x 20 x 3': { weight: 0.9, depth: 20, width: 20 },
                '25 x 25 x 3': { weight: 1.1, depth: 25, width: 25 },
                '30 x 30 x 3': { weight: 1.4, depth: 30, width: 30 },
                '35 x 35 x 3': { weight: 1.6, depth: 35, width: 35 },
                '40 x 40 x 3': { weight: 1.9, depth: 40, width: 40 },
                '45 x 45 x 4': { weight: 2.7, depth: 45, width: 45 },
                '50 x 50 x 4': { weight: 3.0, depth: 50, width: 50 },
                '55 x 55 x 4': { weight: 3.3, depth: 55, width: 55 },
                '60 x 60 x 4': { weight: 3.6, depth: 60, width: 60 },
                '65 x 65 x 5': { weight: 4.9, depth: 65, width: 65 },
                '70 x 70 x 5': { weight: 5.3, depth: 70, width: 70 },
                '75 x 75 x 5': { weight: 5.7, depth: 75, width: 75 },
                '80 x 80 x 6': { weight: 7.3, depth: 80, width: 80 },
                '90 x 90 x 6': { weight: 8.2, depth: 90, width: 90 },
                '100 x 100 x 6': { weight: 9.2, depth: 100, width: 100 },
                '110 x 110 x 8': { weight: 13.4, depth: 110, width: 110 },
                '130 x 130 x 8': { weight: 15.8, depth: 130, width: 130 },
                '150 x 150 x 10': { weight: 22.8, depth: 150, width: 150 },
                '180 x 180 x 12': { weight: 32.7, depth: 180, width: 180 },
                '200 x 200 x 12': { weight: 36.3, depth: 200, width: 200 }
            },
            'ISA-unequal': {
                '30 x 20 x 3': { weight: 1.1, depth: 30, width: 20 },
                '40 x 25 x 3': { weight: 1.5, depth: 40, width: 25 },
                '50 x 30 x 4': { weight: 2.4, depth: 50, width: 30 },
                '60 x 40 x 4': { weight: 3.1, depth: 60, width: 40 },
                '70 x 50 x 5': { weight: 4.6, depth: 70, width: 50 },
                '80 x 60 x 5': { weight: 5.4, depth: 80, width: 60 },
                '90 x 60 x 6': { weight: 6.8, depth: 90, width: 60 },
                '100 x 75 x 6': { weight: 8.1, depth: 100, width: 75 },
                '110 x 80 x 6': { weight: 8.8, depth: 110, width: 80 },
                '130 x 90 x 8': { weight: 13.7, depth: 130, width: 90 },
                '150 x 100 x 8': { weight: 15.4, depth: 150, width: 100 },
                '180 x 110 x 10': { weight: 22.2, depth: 180, width: 110 },
                '200 x 150 x 10': { weight: 26.8, depth: 200, width: 150 }
            },

        };
    }

    // Update section sizes based on selected type
    updateSectionSizes(sectionType) {
        const sizeSelect = document.getElementById('sectionSize');
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        sizeSelect.disabled = true;

        if (sectionType && this.sectionDatabase[sectionType]) {
            sizeSelect.disabled = false;
            Object.keys(this.sectionDatabase[sectionType]).forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
        }
    }

    // Add standard section
    addStandardSection() {
        const sectionType = document.getElementById('sectionType').value;
        const sectionSize = document.getElementById('sectionSize').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const length = parseFloat(document.getElementById('length').value);

        if (!sectionType || !sectionSize || !quantity || !length) {
            this.showMessage('Please fill all fields for standard section', 'error');
            return;
        }

        const sectionData = this.sectionDatabase[sectionType][sectionSize];
        const totalWeight = sectionData.weight * length * quantity;

        const section = {
            id: Date.now(),
            type: sectionType,
            size: sectionSize,
            quantity: quantity,
            length: length,
            unitWeight: sectionData.weight,
            totalWeight: totalWeight,
            depth: sectionData.depth,
            width: sectionData.width
        };

        this.standardSections.push(section);
        this.updateSummaries();
        this.showMessage('Standard section added successfully', 'success');
        this.clearStandardSectionForm();
    }

    // Calculate I-section web height based on total depth and flange thickness
    calculateIWebHeight() {
        const totalDepth = parseFloat(document.getElementById('totalDepth').value) || 0;
        const flangeThickness = parseFloat(document.getElementById('flangeThickness').value) || 0;
        const webHeight = totalDepth - (2 * flangeThickness);
        
        document.getElementById('calculatedWebHeight').value = webHeight > 0 ? webHeight.toFixed(0) : '0';
    }

    // Calculate box section web height based on total depth and flange thickness
    calculateBoxWebHeight() {
        const totalDepth = parseFloat(document.getElementById('boxTotalDepth').value) || 0;
        const flangeThickness = parseFloat(document.getElementById('boxFlangeThickness').value) || 0;
        const webHeight = totalDepth - (2 * flangeThickness);
        
        document.getElementById('calculatedBoxWebHeight').value = webHeight > 0 ? webHeight.toFixed(0) : '0';
    }

    // Get current steel rate from user input or use default
    getCurrentSteelRate() {
        const userRate = parseFloat(document.getElementById('steelRate').value);
        return userRate > 0 ? userRate : this.defaultSteelRate;
    }

    // Add I-section plate girder
    addIGirder() {
        console.log('addIGirder called'); // Debug log
        const name = document.getElementById('girderName').value.trim();
        const length = parseFloat(document.getElementById('girderLength').value);
        const totalDepth = parseFloat(document.getElementById('totalDepth').value);
        const flangeWidth = parseFloat(document.getElementById('flangeWidth').value);
        const flangeThickness = parseFloat(document.getElementById('flangeThickness').value);
        const webThickness = parseFloat(document.getElementById('webThickness').value);

        console.log('Name:', name, 'Length:', length, 'TotalDepth:', totalDepth); // Debug log

        if (!name) {
            console.log('Name is empty, showing warning'); // Debug log
            this.showMessage('⚠️ WARNING: Please enter a section name for the I-section plate girder', 'error');
            return;
        }

        if (!length || !totalDepth || !flangeWidth || !flangeThickness || !webThickness) {
            this.showMessage('Please fill all required fields for I-section girder', 'error');
            return;
        }

        // Calculate web height
        const webHeight = totalDepth - (2 * flangeThickness);
        
        if (webHeight <= 0) {
            this.showMessage('Invalid dimensions: Web height would be zero or negative', 'error');
            return;
        }

        // Calculate plate weights
        const webArea = webHeight * webThickness / 1000000; // m²
        const webWeight = webArea * length * 7850; // kg (steel density)

        const flangeArea = flangeWidth * flangeThickness / 1000000; // m²
        const flangeWeight = flangeArea * length * 7850 * 2; // kg (2 flanges)

        const totalWeight = webWeight + flangeWeight;
        const unitWeight = totalWeight / length; // kg per metre

        const girder = {
            id: Date.now(),
            name: name,
            length: length,
            totalDepth: totalDepth,
            webHeight: webHeight,
            webThickness: webThickness,
            flangeWidth: flangeWidth,
            flangeThickness: flangeThickness,
            webWeight: webWeight,
            flangeWeight: flangeWeight,
            totalWeight: totalWeight,
            unitWeight: unitWeight,
            plates: [
                {
                    type: 'Web Plate',
                    dimensions: `${webHeight} x ${length * 1000}`,
                    thickness: webThickness,
                    quantity: 1,
                    area: webArea * length,
                    weight: webWeight
                },
                {
                    type: 'Flange Plate',
                    dimensions: `${flangeWidth} x ${length * 1000}`,
                    thickness: flangeThickness,
                    quantity: 2,
                    area: flangeArea * length * 2,
                    weight: flangeWeight
                }
            ]
        };

        this.iGirders.push(girder);
        this.updateSummaries();
        this.showMessage('I-section plate girder added successfully', 'success');
        this.clearIGirderForm();
    }

    // Add box section plate girder
    addBoxGirder() {
        console.log('addBoxGirder called'); // Debug log
        const name = document.getElementById('boxGirderName').value.trim();
        const length = parseFloat(document.getElementById('boxGirderLength').value);
        const totalDepth = parseFloat(document.getElementById('boxTotalDepth').value);
        const width = parseFloat(document.getElementById('boxWidth').value);
        const flangeThickness = parseFloat(document.getElementById('boxFlangeThickness').value);
        const webThickness = parseFloat(document.getElementById('boxWebThickness').value);

        console.log('Box Name:', name, 'Length:', length, 'TotalDepth:', totalDepth); // Debug log

        if (!name) {
            console.log('Box name is empty, showing warning'); // Debug log
            this.showMessage('⚠️ WARNING: Please enter a section name for the box section plate girder', 'error');
            return;
        }

        if (!length || !totalDepth || !width || !flangeThickness || !webThickness) {
            this.showMessage('Please fill all required fields for box section girder', 'error');
            return;
        }

        // Calculate web height
        const webHeight = totalDepth - (2 * flangeThickness);
        
        if (webHeight <= 0) {
            this.showMessage('Invalid dimensions: Web height would be zero or negative', 'error');
            return;
        }

        // Calculate plate weights
        const topArea = width * flangeThickness / 1000000; // m²
        const topWeight = topArea * length * 7850; // kg

        const bottomArea = width * flangeThickness / 1000000; // m²
        const bottomWeight = bottomArea * length * 7850; // kg

        const sideArea = webHeight * webThickness / 1000000; // m²
        const sideWeight = sideArea * length * 7850 * 2; // kg (2 sides)

        const totalWeight = topWeight + bottomWeight + sideWeight;
        const unitWeight = totalWeight / length; // kg per metre

        const girder = {
            id: Date.now(),
            name: name,
            length: length,
            totalDepth: totalDepth,
            webHeight: webHeight,
            width: width,
            flangeThickness: flangeThickness,
            webThickness: webThickness,
            topWeight: topWeight,
            bottomWeight: bottomWeight,
            sideWeight: sideWeight,
            totalWeight: totalWeight,
            unitWeight: unitWeight,
            plates: [
                {
                    type: 'Flange Plate',
                    dimensions: `${width} x ${length * 1000}`,
                    thickness: flangeThickness,
                    quantity: 2,
                    area: (topArea + bottomArea) * length,
                    weight: topWeight + bottomWeight
                },
                {
                    type: 'Web Plate',
                    dimensions: `${webHeight} x ${length * 1000}`,
                    thickness: webThickness,
                    quantity: 2,
                    area: sideArea * length,
                    weight: sideWeight
                }
            ]
        };

        this.boxGirders.push(girder);
        this.updateSummaries();
        this.showMessage('Box section plate girder added successfully', 'success');
        this.clearBoxGirderForm();
    }

    // Show message
    showMessage(message, type) {
        console.log('Showing message:', message, type); // Debug log
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 5000); // Increased to 5 seconds for better visibility
        } else {
            console.error('Main content not found');
        }
    }

    // Clear standard section form
    clearStandardSectionForm() {
        document.getElementById('sectionType').value = '';
        document.getElementById('sectionSize').value = '';
        document.getElementById('sectionSize').disabled = true;
        document.getElementById('quantity').value = '1';
        document.getElementById('length').value = '1.0';
    }

    // Clear I-section girder form
    clearIGirderForm() {
        document.getElementById('girderName').value = '';
        document.getElementById('girderLength').value = '10.0';
        document.getElementById('totalDepth').value = '800';
        document.getElementById('flangeWidth').value = '300';
        document.getElementById('flangeThickness').value = '12';
        document.getElementById('webThickness').value = '8';
        this.calculateIWebHeight();
    }

    // Clear box section girder form
    clearBoxGirderForm() {
        document.getElementById('boxGirderName').value = '';
        document.getElementById('boxGirderLength').value = '10.0';
        document.getElementById('boxTotalDepth').value = '800';
        document.getElementById('boxWidth').value = '400';
        document.getElementById('boxFlangeThickness').value = '12';
        document.getElementById('boxWebThickness').value = '8';
        this.calculateBoxWebHeight();
    }

    // Clear all data
    clearAll() {
        if (confirm('Are you sure you want to clear all data?')) {
            this.standardSections = [];
            this.iGirders = [];
            this.boxGirders = [];
            this.updateSummaries();
            this.showMessage('All data cleared successfully', 'success');
        }
    }

    // Update all summaries
    updateSummaries() {
        this.updateSectionSummary();
        this.updatePlateSummary();
        this.updateDetailedBreakdown();
        this.updateTotalSummary();
    }

    // Update section-wise summary
    updateSectionSummary() {
        const tbody = document.getElementById('sectionTableBody');
        tbody.innerHTML = '';

        // Add standard sections
        this.standardSections.forEach(section => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${section.type}</td>
                <td>${section.size}</td>
                <td>${section.quantity}</td>
                <td>${section.length}</td>
                <td>${section.unitWeight.toFixed(2)}</td>
                <td>${section.totalWeight.toFixed(2)}</td>
            `;
        });

        // Add I-section girders
        this.iGirders.forEach(girder => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>I-Section Plate Girder</td>
                <td>${girder.name}</td>
                <td>1</td>
                <td>${girder.length}</td>
                <td>${girder.unitWeight.toFixed(2)}</td>
                <td>${girder.totalWeight.toFixed(2)}</td>
            `;
        });

        // Add box section girders
        this.boxGirders.forEach(girder => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>Box Section Plate Girder</td>
                <td>${girder.name}</td>
                <td>1</td>
                <td>${girder.length}</td>
                <td>${girder.unitWeight.toFixed(2)}</td>
                <td>${girder.totalWeight.toFixed(2)}</td>
            `;
        });
    }

    // Update plate-wise summary
    updatePlateSummary() {
        const tbody = document.getElementById('plateTableBody');
        const tfoot = document.getElementById('plateTableFooter');
        tbody.innerHTML = '';
        tfoot.innerHTML = '';

        let totalPlateWeight = 0;

        // Add plates from I-section girders
        this.iGirders.forEach(girder => {
            let girderTotalWeight = 0;
            
            girder.plates.forEach(plate => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${girder.name}</td>
                    <td>${plate.type}</td>
                    <td>${plate.dimensions}</td>
                    <td>${plate.thickness}</td>
                    <td>${plate.quantity}</td>
                    <td>${plate.area.toFixed(2)}</td>
                    <td>${plate.weight.toFixed(2)}</td>
                `;
                girderTotalWeight += plate.weight;
            });

            // Add girder total row
            if (girder.plates.length > 1) {
                const totalRow = tbody.insertRow();
                totalRow.style.backgroundColor = '#f8f9fa';
                totalRow.style.fontWeight = 'bold';
                totalRow.innerHTML = `
                    <td colspan="6" style="text-align: right;"><strong>${girder.name} - Total Weight:</strong></td>
                    <td><strong>${girderTotalWeight.toFixed(2)} kg</strong></td>
                `;
            }
            
            totalPlateWeight += girderTotalWeight;
        });

        // Add plates from box section girders
        this.boxGirders.forEach(girder => {
            let girderTotalWeight = 0;
            
            girder.plates.forEach(plate => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${girder.name}</td>
                    <td>${plate.type}</td>
                    <td>${plate.dimensions}</td>
                    <td>${plate.thickness}</td>
                    <td>${plate.quantity}</td>
                    <td>${plate.area.toFixed(2)}</td>
                    <td>${plate.weight.toFixed(2)}</td>
                `;
                girderTotalWeight += plate.weight;
            });

            // Add girder total row
            if (girder.plates.length > 1) {
                const totalRow = tbody.insertRow();
                totalRow.style.backgroundColor = '#f8f9fa';
                totalRow.style.fontWeight = 'bold';
                totalRow.innerHTML = `
                    <td colspan="6" style="text-align: right;"><strong>${girder.name} - Total Weight:</strong></td>
                    <td><strong>${girderTotalWeight.toFixed(2)} kg</strong></td>
                `;
            }
            
            totalPlateWeight += girderTotalWeight;
        });

        // Add overall total in footer
        if (totalPlateWeight > 0) {
            const footerRow = tfoot.insertRow();
            footerRow.style.backgroundColor = '#e9ecef';
            footerRow.style.fontWeight = 'bold';
            footerRow.style.fontSize = '1.1rem';
            footerRow.innerHTML = `
                <td colspan="6" style="text-align: right;"><strong>TOTAL WEIGHT:</strong></td>
                <td><strong>${totalPlateWeight.toFixed(2)} kg</strong></td>
            `;
        }

        // Add thickness-wise summary
        this.addThicknessWiseSummary();
    }

    // Add thickness-wise summary
    addThicknessWiseSummary() {
        const tfoot = document.getElementById('plateTableFooter');
        
        // Collect all plates by thickness
        const thicknessMap = new Map();

        // Add plates from I-section girders
        this.iGirders.forEach(girder => {
            girder.plates.forEach(plate => {
                const key = plate.thickness;
                if (!thicknessMap.has(key)) {
                    thicknessMap.set(key, {
                        thickness: key,
                        totalWeight: 0,
                        count: 0
                    });
                }
                const entry = thicknessMap.get(key);
                entry.totalWeight += plate.weight;
                entry.count += plate.quantity;
            });
        });

        // Add plates from box section girders
        this.boxGirders.forEach(girder => {
            girder.plates.forEach(plate => {
                const key = plate.thickness;
                if (!thicknessMap.has(key)) {
                    thicknessMap.set(key, {
                        thickness: key,
                        totalWeight: 0,
                        count: 0
                    });
                }
                const entry = thicknessMap.get(key);
                entry.totalWeight += plate.weight;
                entry.count += plate.quantity;
            });
        });

        // Add thickness-wise summary rows
        const sortedThicknesses = Array.from(thicknessMap.keys()).sort((a, b) => a - b);
        
        if (sortedThicknesses.length > 0) {
            // Add separator row
            const separatorRow = tfoot.insertRow();
            separatorRow.style.backgroundColor = '#dee2e6';
            separatorRow.innerHTML = `<td colspan="7" style="text-align: center; font-weight: bold; padding: 10px;">THICKNESS-WISE SUMMARY</td>`;

            // Create horizontal grid for thickness summary
            const maxColumns = 3; // Maximum columns in the grid
            const thicknessEntries = sortedThicknesses.map(thickness => {
                const entry = thicknessMap.get(thickness);
                return { thickness, weight: entry.totalWeight };
            });

            // Group thicknesses into rows
            for (let i = 0; i < thicknessEntries.length; i += maxColumns) {
                const rowEntries = thicknessEntries.slice(i, i + maxColumns);
                const thicknessRow = tfoot.insertRow();
                thicknessRow.style.backgroundColor = '#f8f9fa';
                thicknessRow.style.fontWeight = 'bold';
                
                let rowHTML = '';
                rowEntries.forEach((entry, index) => {
                    const colSpan = index === 0 ? 2 : 2; // First item takes 2 cols, others take 2 cols
                    const textAlign = index === 0 ? 'right' : 'center';
                    rowHTML += `<td colspan="${colSpan}" style="text-align: ${textAlign}; padding: 8px;"><strong>${entry.thickness}mm:</strong></td>`;
                    rowHTML += `<td style="text-align: left; padding: 8px;"><strong>${entry.weight.toFixed(2)} kg</strong></td>`;
                });
                
                // Fill remaining cells if row is not full
                const remainingCols = maxColumns - rowEntries.length;
                if (remainingCols > 0) {
                    rowHTML += `<td colspan="${remainingCols * 2}" style="text-align: center;"></td>`;
                }
                
                thicknessRow.innerHTML = rowHTML;
            }
        }
    }

    // Update detailed breakdown
    updateDetailedBreakdown() {
        // Standard sections
        const standardList = document.getElementById('standardSectionsList');
        standardList.innerHTML = '';
        
        if (this.standardSections.length === 0) {
            standardList.innerHTML = '<p>No standard sections added</p>';
        } else {
            this.standardSections.forEach(section => {
                const div = document.createElement('div');
                div.className = 'breakdown-item';
                div.innerHTML = `
                    <strong>${section.type} ${section.size}</strong><br>
                    Quantity: ${section.quantity}, Length: ${section.length}m<br>
                    Unit Weight: ${section.unitWeight} kg/m, Total Weight: ${section.totalWeight.toFixed(2)} kg
                `;
                standardList.appendChild(div);
            });
        }

        // I-section girders
        const iGirdersList = document.getElementById('iGirdersList');
        iGirdersList.innerHTML = '';
        
        if (this.iGirders.length === 0) {
            iGirdersList.innerHTML = '<p>No I-section plate girders added</p>';
        } else {
            this.iGirders.forEach(girder => {
                const div = document.createElement('div');
                div.className = 'breakdown-item';
                div.innerHTML = `
                    <strong>${girder.name}</strong><br>
                    Length: ${girder.length}m, Total Depth: ${girder.totalDepth}mm<br>
                    Flange Width: ${girder.flangeWidth}mm, Flange Thickness: ${girder.flangeThickness}mm, Web Thickness: ${girder.webThickness}mm<br>
                    Unit Weight: ${girder.unitWeight.toFixed(2)} kg/m, Total Weight: ${girder.totalWeight.toFixed(2)} kg
                `;
                iGirdersList.appendChild(div);
            });
        }

        // Box section girders
        const boxGirdersList = document.getElementById('boxGirdersList');
        boxGirdersList.innerHTML = '';
        
        if (this.boxGirders.length === 0) {
            boxGirdersList.innerHTML = '<p>No box section plate girders added</p>';
        } else {
            this.boxGirders.forEach(girder => {
                const div = document.createElement('div');
                div.className = 'breakdown-item';
                div.innerHTML = `
                    <strong>${girder.name}</strong><br>
                    Length: ${girder.length}m, Total Depth: ${girder.totalDepth}mm, Flange Width: ${girder.width}mm<br>
                    Flange Thickness: ${girder.flangeThickness}mm, Web Thickness: ${girder.webThickness}mm<br>
                    Unit Weight: ${girder.unitWeight.toFixed(2)} kg/m, Total Weight: ${girder.totalWeight.toFixed(2)} kg
                `;
                boxGirdersList.appendChild(div);
            });
        }
    }

    // Update total summary
    updateTotalSummary() {
        const standardWeight = this.standardSections.reduce((sum, section) => sum + section.totalWeight, 0);
        const girderWeight = this.iGirders.reduce((sum, girder) => sum + girder.totalWeight, 0) +
                            this.boxGirders.reduce((sum, girder) => sum + girder.totalWeight, 0);
        const totalWeight = standardWeight + girderWeight;
        const currentSteelRate = this.getCurrentSteelRate();
        const totalCost = totalWeight * currentSteelRate; // Cost in ₹

        document.getElementById('totalWeight').textContent = `${totalWeight.toFixed(2)} kg`;
        document.getElementById('standardWeight').textContent = `${standardWeight.toFixed(2)} kg`;
        document.getElementById('girderWeight').textContent = `${girderWeight.toFixed(2)} kg`;
        document.getElementById('totalCost').textContent = `₹${totalCost.toFixed(2)}`;
    }

    // Export to Excel
    exportToExcel() {
        const projectName = document.getElementById('projectName').value || 'Steel_BOM';
        const buildingName = document.getElementById('buildingName').value || '';
        const projectDate = document.getElementById('projectDate').value || new Date().toISOString().split('T')[0];
        const engineer = document.getElementById('engineer').value || '';

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Project Information Sheet
        const currentSteelRate = this.getCurrentSteelRate();
        const projectInfo = [
            ['PROJECT INFORMATION'],
            [''],
            ['Project Name:', projectName],
            ['Building / Structure Name:', buildingName],
            ['Date:', projectDate],
            ['Engineer:', engineer],
            ['Steel Rate:', `₹${currentSteelRate.toFixed(2)} per kg`],
            [''],
            ['TOTAL SUMMARY'],
            [''],
            ['Total Weight:', `${this.getTotalWeight().toFixed(2)} kg`],
            ['Standard Sections Weight:', `${this.getStandardWeight().toFixed(2)} kg`],
            ['Plate Girders Weight:', `${this.getGirderWeight().toFixed(2)} kg`],
            ['Total Cost (₹):', `₹${this.getTotalCost().toFixed(2)}`],
            [''],
            ['Steel Rate Used:', `₹${currentSteelRate.toFixed(2)} per kg`]
        ];

        const wsProject = XLSX.utils.aoa_to_sheet(projectInfo);
        XLSX.utils.book_append_sheet(wb, wsProject, "Project Info");

        // Section Summary Sheet
        const sectionData = [
            ['SECTION-WISE SUMMARY'],
            [''],
            ['Section Type', 'Size', 'Quantity', 'Length (m)', 'Unit Weight (kg/m)', 'Total Weight (kg)']
        ];

        // Add standard sections
        this.standardSections.forEach(section => {
            sectionData.push([
                section.type,
                section.size,
                section.quantity,
                section.length,
                section.unitWeight,
                section.totalWeight.toFixed(2)
            ]);
        });

        // Add plate girders
        this.iGirders.forEach(girder => {
            sectionData.push([
                'I-Section Plate Girder',
                girder.name,
                1,
                girder.length,
                girder.unitWeight.toFixed(2),
                girder.totalWeight.toFixed(2)
            ]);
        });

        this.boxGirders.forEach(girder => {
            sectionData.push([
                'Box Section Plate Girder',
                girder.name,
                1,
                girder.length,
                girder.unitWeight.toFixed(2),
                girder.totalWeight.toFixed(2)
            ]);
        });

        const wsSection = XLSX.utils.aoa_to_sheet(sectionData);
        XLSX.utils.book_append_sheet(wb, wsSection, "Section Summary");

        // Plate Summary Sheet
        const plateData = [
            ['PLATE-WISE SUMMARY'],
            [''],
            ['Plate Type', 'Dimensions (mm)', 'Thickness (mm)', 'Quantity', 'Area (m²)', 'Weight (kg)']
        ];

        // Add plates from I-section girders
        this.iGirders.forEach(girder => {
            girder.plates.forEach(plate => {
                plateData.push([
                    `${plate.type} (${girder.name})`,
                    plate.dimensions,
                    plate.thickness,
                    plate.quantity,
                    plate.area.toFixed(2),
                    plate.weight.toFixed(2)
                ]);
            });
        });

        // Add plates from box section girders
        this.boxGirders.forEach(girder => {
            girder.plates.forEach(plate => {
                plateData.push([
                    `${plate.type} (${girder.name})`,
                    plate.dimensions,
                    plate.thickness,
                    plate.quantity,
                    plate.area.toFixed(2),
                    plate.weight.toFixed(2)
                ]);
            });
        });

        const wsPlate = XLSX.utils.aoa_to_sheet(plateData);
        XLSX.utils.book_append_sheet(wb, wsPlate, "Plate Summary");

        // Section-wise Summary Sheet
        const sectionWiseData = [
            ['SECTION-WISE SUMMARY'],
            [''],
            ['Section Type', 'Section Name', 'Quantity', 'Length (m)', 'Unit Weight (kg/m)', 'Total Weight (kg)']
        ];

        // Add standard sections
        this.standardSections.forEach(section => {
            sectionWiseData.push([
                section.type,
                section.size,
                section.quantity,
                section.length,
                section.unitWeight,
                section.totalWeight.toFixed(2)
            ]);
        });

        // Add I-section girders
        this.iGirders.forEach(girder => {
            sectionWiseData.push([
                'I-Section Plate Girder',
                girder.name,
                1,
                girder.length,
                girder.unitWeight.toFixed(2),
                girder.totalWeight.toFixed(2)
            ]);
        });

        // Add box section girders
        this.boxGirders.forEach(girder => {
            sectionWiseData.push([
                'Box Section Plate Girder',
                girder.name,
                1,
                girder.length,
                girder.unitWeight.toFixed(2),
                girder.totalWeight.toFixed(2)
            ]);
        });

        const wsSectionWise = XLSX.utils.aoa_to_sheet(sectionWiseData);
        XLSX.utils.book_append_sheet(wb, wsSectionWise, "Section-wise Summary");

        // Plate Thickness-wise Summary Sheet
        const thicknessWiseData = [
            ['PLATE THICKNESS-WISE SUMMARY'],
            [''],
            ['Thickness (mm)', 'Plate Type', 'Total Area (m²)', 'Total Weight (kg)', 'Count']
        ];

        // Collect all plates by thickness
        const thicknessMap = new Map();

        // Add plates from I-section girders
        this.iGirders.forEach(girder => {
            girder.plates.forEach(plate => {
                const key = plate.thickness;
                if (!thicknessMap.has(key)) {
                    thicknessMap.set(key, {
                        thickness: key,
                        plates: [],
                        totalArea: 0,
                        totalWeight: 0,
                        count: 0
                    });
                }
                const entry = thicknessMap.get(key);
                entry.plates.push(`${plate.type} (${girder.name})`);
                entry.totalArea += plate.area;
                entry.totalWeight += plate.weight;
                entry.count += plate.quantity;
            });
        });

        // Add plates from box section girders
        this.boxGirders.forEach(girder => {
            girder.plates.forEach(plate => {
                const key = plate.thickness;
                if (!thicknessMap.has(key)) {
                    thicknessMap.set(key, {
                        thickness: key,
                        plates: [],
                        totalArea: 0,
                        totalWeight: 0,
                        count: 0
                    });
                }
                const entry = thicknessMap.get(key);
                entry.plates.push(`${plate.type} (${girder.name})`);
                entry.totalArea += plate.area;
                entry.totalWeight += plate.weight;
                entry.count += plate.quantity;
            });
        });

        // Sort by thickness and add to data
        const sortedThicknesses = Array.from(thicknessMap.keys()).sort((a, b) => a - b);
        sortedThicknesses.forEach(thickness => {
            const entry = thicknessMap.get(thickness);
            thicknessWiseData.push([
                entry.thickness,
                entry.plates.join(', '),
                entry.totalArea.toFixed(2),
                entry.totalWeight.toFixed(2),
                entry.count
            ]);
        });

        const wsThicknessWise = XLSX.utils.aoa_to_sheet(thicknessWiseData);
        XLSX.utils.book_append_sheet(wb, wsThicknessWise, "Thickness-wise Summary");

        // Detailed Breakdown Sheet
        const detailedData = [
            ['DETAILED BREAKDOWN'],
            ['']
        ];

        // Standard sections
        detailedData.push(['STANDARD SECTIONS']);
        detailedData.push(['']);
        if (this.standardSections.length === 0) {
            detailedData.push(['No standard sections added']);
        } else {
            this.standardSections.forEach(section => {
                detailedData.push([
                    `${section.type} ${section.size}`,
                    `Quantity: ${section.quantity}, Length: ${section.length}m`,
                    `Unit Weight: ${section.unitWeight} kg/m, Total Weight: ${section.totalWeight.toFixed(2)} kg`
                ]);
                detailedData.push(['']);
            });
        }

        // I-section girders
        detailedData.push(['I-SECTION PLATE GIRDERS']);
        detailedData.push(['']);
        if (this.iGirders.length === 0) {
            detailedData.push(['No I-section plate girders added']);
        } else {
            this.iGirders.forEach(girder => {
                detailedData.push([
                    girder.name,
                    `Length: ${girder.length}m, Total Depth: ${girder.totalDepth}mm`,
                    `Web: ${girder.webHeight}x${girder.webThickness}mm, Flanges: ${girder.flangeWidth}x${girder.flangeThickness}mm`,
                    `Unit Weight: ${girder.unitWeight.toFixed(2)} kg/m, Total Weight: ${girder.totalWeight.toFixed(2)} kg`
                ]);
                detailedData.push(['']);
            });
        }

        // Box section girders
        detailedData.push(['BOX SECTION PLATE GIRDERS']);
        detailedData.push(['']);
        if (this.boxGirders.length === 0) {
            detailedData.push(['No box section plate girders added']);
        } else {
            this.boxGirders.forEach(girder => {
                detailedData.push([
                    girder.name,
                    `Length: ${girder.length}m, Total Depth: ${girder.totalDepth}mm, Flange Width: ${girder.width}mm`,
                    `Web: ${girder.webHeight}x${girder.webThickness}mm, Flanges: ${girder.flangeThickness}mm`,
                    `Unit Weight: ${girder.unitWeight.toFixed(2)} kg/m, Total Weight: ${girder.totalWeight.toFixed(2)} kg`
                ]);
                detailedData.push(['']);
            });
        }

        const wsDetailed = XLSX.utils.aoa_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(wb, wsDetailed, "Detailed Breakdown");

        // Generate and download Excel file
        XLSX.writeFile(wb, `${projectName}_BOM.xlsx`);
        
        this.showMessage('Excel file exported successfully', 'success');
    }

    // Helper methods for getting totals
    getTotalWeight() {
        const standardWeight = this.standardSections.reduce((sum, section) => sum + section.totalWeight, 0);
        const girderWeight = this.iGirders.reduce((sum, girder) => sum + girder.totalWeight, 0) +
                            this.boxGirders.reduce((sum, girder) => sum + girder.totalWeight, 0);
        return standardWeight + girderWeight;
    }

    getStandardWeight() {
        return this.standardSections.reduce((sum, section) => sum + section.totalWeight, 0);
    }

    getGirderWeight() {
        return this.iGirders.reduce((sum, girder) => sum + girder.totalWeight, 0) +
               this.boxGirders.reduce((sum, girder) => sum + girder.totalWeight, 0);
    }

    getTotalCost() {
        return this.getTotalWeight() * this.getCurrentSteelRate(); // Cost in ₹
    }

    // Print BOM
    printBOM() {
        window.print();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SteelBOMCalculator();
});

// Add some CSS for breakdown items and calculated fields
const style = document.createElement('style');
style.textContent = `
    .breakdown-item {
        background: white;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #3498db;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .breakdown-item strong {
        color: #2c3e50;
        font-size: 1.1rem;
    }
    
    .breakdown-item p {
        margin: 5px 0;
        color: #7f8c8d;
    }
    
    #calculatedWebHeight, #calculatedBoxWebHeight {
        background-color: #f8f9fa;
        color: #495057;
        font-weight: 500;
        border: 2px solid #28a745;
    }
    
    #calculatedWebHeight:focus, #calculatedBoxWebHeight:focus {
        outline: none;
        border-color: #28a745;
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }
    
    .form-help {
        color: #6c757d;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: block;
        font-style: italic;
    }
    
    .message.error {
        background-color: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
    }
    
    .message.error::before {
        content: "⚠️ ";
        font-weight: bold;
    }
`;
document.head.appendChild(style);
  
