// ============================================================

// === VAST ENTERPRISE ARCHITECT v2.0 ===

// === Complete Business Logic app.js ===

// === Targets index.html (6-panel wizard) ===

// ============================================================



'use strict';



// ============================================================

// === SECTION 1: DB MODULE (IndexedDB) ===

// ============================================================



const DB = {

  name: 'VASTArchitectDB', version: 2, db: null,

  stores: {

    configs:       { keyPath: 'id', autoIncrement: true },

    checkpoints:   { keyPath: 'id', autoIncrement: true },

    knowledgeBase: { keyPath: 'key' },

    sessions:      { keyPath: 'id' }

  },

  async init() {

    return new Promise((resolve) => {

      const req = indexedDB.open(this.name, this.version);

      req.onupgradeneeded = (ev) => {

        const db = ev.target.result;

        Object.entries(this.stores).forEach(([sn, opts]) => {

          if (!db.objectStoreNames.contains(sn)) db.createObjectStore(sn, opts);

        });

      };

      req.onsuccess = (ev) => { this.db = ev.target.result; resolve(this.db); };

      req.onerror   = ()      => { console.warn('IndexedDB unavailable'); resolve(null); };

    });

  },

  async save(store, data) {

    if (!this.db) return null;

    return new Promise((resolve) => {

      const tx = this.db.transaction([store], 'readwrite');

      const r  = tx.objectStore(store).put(data);

      r.onsuccess = () => resolve(r.result);

      r.onerror   = ()  => resolve(null);

    });

  },

  async get(store, key) {

    if (!this.db) return null;

    return new Promise((resolve) => {

      const tx = this.db.transaction([store], 'readonly');

      const r  = tx.objectStore(store).get(key);

      r.onsuccess = () => resolve(r.result || null);

      r.onerror   = () => resolve(null);

    });

  },

  async getAll(store) {

    if (!this.db) return [];

    return new Promise((resolve) => {

      const tx = this.db.transaction([store], 'readonly');

      const r  = tx.objectStore(store).getAll();

      r.onsuccess = () => resolve(r.result || []);

      r.onerror   = () => resolve([]);

    });

  },

  async delete(store, key) {

    if (!this.db) return false;

    return new Promise((resolve) => {

      const tx = this.db.transaction([store], 'readwrite');

      const r  = tx.objectStore(store).delete(key);

      r.onsuccess = () => resolve(true);

      r.onerror   = () => resolve(false);

    });

  },

  async clear(store) {

    if (!this.db) return false;

    return new Promise((resolve) => {

      const tx = this.db.transaction([store], 'readwrite');

      const r  = tx.objectStore(store).clear();

      r.onsuccess = () => resolve(true);

      r.onerror   = () => resolve(false);

    });

  }

};



// ============================================================

// === SECTION 2: PRODUCT CATALOG ===

// ============================================================



const PRODUCT_CATALOG = {

  cboxModels: [

    { id:'cbox-standard', name:'VAST CBox (Standard)', description:'Chassis with 4 CNodes (2U)', ruSize:2, cnodesIncluded:4,

      cpu:'AMD EPYC 9555P Turin 64-core', ramPerNode:'384GB DDR5-6400', networkPerNode:'4x200GbE NDR200', powerPerNode:800, weightKg:25,

      notes:'Stateless compute; no local storage' },

    { id:'cbox-x', name:'VAST CNode-X (GPU)', description:'GPU-accelerated AI inference node', ruSize:2, cnodesIncluded:1,

      cpu:'AMD EPYC 5th Gen', ramPerNode:'4TB DDR5', gpus:'8x NVIDIA RTX PRO 6000 96GB GDDR7', networkPerNode:'4x200GbE NDR BlueField-3',

      powerPerNode:3000, weightKg:40, notes:'Specialized for AI inference at the data layer' }

  ],

  dboxModels: [

    { id:'ceres-df3015', name:'VAST Ceres DF-3015V2', description:'High-density 1U NVMe D-Node', ruSize:1,

      qlcCapacityTB:338, scmCapacityTB:6.4, totalRawTB:344.4, dpu:'NVIDIA BlueField-3', powerWatts:1600, weightKg:18,

      notes:'E1.L QLC SSDs PCIe Gen4 + SCM write buffers' },

    { id:'ceres-df3060', name:'VAST Ceres DF-3060V2', description:'Maximum-density 1U NVMe D-Node', ruSize:1,

      qlcCapacityTB:1352, scmCapacityTB:12, totalRawTB:1364, dpu:'NVIDIA BlueField-3', powerWatts:1600, weightKg:20,

      notes:'Highest density for capacity-optimized deployments' },

    { id:'ebox-supermicro', name:'VAST EBox (Supermicro)', description:'Converged CNode+DNode EBox', ruSize:2,

      totalRawTB:30, qlcCapacityTB:30, scmCapacityTB:1, powerWatts:1200, weightKg:22,

      partnerModel:'Supermicro AS-2115GT-HNTF', notes:'EBox architecture; runs VAST AI OS on x86. VastOS 5.2+' },

    { id:'ebox-cisco', name:'VAST EBox (Cisco)', description:'Cisco AI Data Platform EBox', ruSize:2,

      totalRawTB:25, qlcCapacityTB:25, scmCapacityTB:1, powerWatts:1100, weightKg:20,

      partnerModel:'Cisco UCS C845A M8', notes:'Cisco AI Data Platform; validated for VAST AI OS' }

  ],

  switchModels: [

    { id:'arista-7050cx3',   name:'Arista 7050CX3-32S',          ports:'32x100GbE QSFP28', fabricType:'RoCEv2',     ruSize:1, bufferMB:40  },

    { id:'arista-7060cx2',   name:'Arista 7060CX2-32S',          ports:'32x100GbE QSFP28', fabricType:'RoCEv2',     ruSize:1, bufferMB:32  },

    { id:'arista-7800r3',    name:'Arista 7800R3',                ports:'Modular 400GbE',   fabricType:'RoCEv2',     ruSize:7, bufferMB:256 },

    { id:'cisco-nexus-9336', name:'Cisco Nexus 9336C-FX2',       ports:'36x100GbE QSFP28', fabricType:'RoCEv2',     ruSize:1, bufferMB:32  },

    { id:'nvidia-spectrum3', name:'NVIDIA Spectrum-3 MQM9700',   ports:'64x400GbE QSFP-DD',fabricType:'RoCEv2',     ruSize:1, bufferMB:64  },

    { id:'nvidia-qm8700',    name:'NVIDIA QM8700 IB HDR',        ports:'40x HDR 200Gb',    fabricType:'InfiniBand', ruSize:1, bufferMB:64  },

    { id:'nvidia-qm9700',    name:'NVIDIA QM9700 IB NDR',        ports:'64x NDR 400Gb',    fabricType:'InfiniBand', ruSize:1, bufferMB:64  },

    { id:'generic-rocev2',   name:'Generic RoCEv2 Eth Switch',   ports:'32x100GbE',        fabricType:'RoCEv2',     ruSize:1, bufferMB:16  }

  ],

  vastosVersions: [

    { version:'5.0.0',     releaseDate:'2024-Q1', features:['Global Sync NFSv3 failover','Multi-Cluster Mgmt','VAST on Cloud','FIPS 140-3'] },

    { version:'5.2.0',     releaseDate:'2024-Q4', features:['EBox architecture','x86 support','Supermicro/Cisco EBox','NVMe/TCP Block'] },

    { version:'5.3.5',     releaseDate:'2025-Q1', features:['Quota Groups','Enhanced SMB','Granular AD/LDAP','NVMe/TCP OpenStack'] },

    { version:'5.4.1-SP4', releaseDate:'2026-Q2', features:['VAST AI OS','DataEngine','DataBase vector','AgentEngine','Kafka API','Polaris'], latest:true }

  ],

  workloadPresets: {

    'ai-ml-training':   { name:'AI/ML Training',         reductionRatio:2.5, readThroughputGBs:200, writeThroughputGBs:40,  clientNet:'200', fabricType:'RoCEv2', notes:'GPUDirect Storage recommended for training.' },

    'ai-training':      { name:'AI/ML Training',         reductionRatio:2.5, readThroughputGBs:200, writeThroughputGBs:40,  clientNet:'200', fabricType:'RoCEv2', notes:'GPUDirect Storage recommended for training.' },

    'hpc-genomics':     { name:'HPC & Genomics',         reductionRatio:3.0, readThroughputGBs:150, writeThroughputGBs:50,  clientNet:'100', fabricType:'RoCEv2', notes:'High parallel read from many HPC nodes.' },

    'vmware-vsphere':   { name:'VMware/vSphere',         reductionRatio:4.0, readThroughputGBs:40,  writeThroughputGBs:15,  clientNet:'25',  fabricType:'RoCEv2', notes:'VAAI-NAS offload; multiple VIPs for NFS multipathing.' },

    'kubernetes-csi':   { name:'Kubernetes CSI',         reductionRatio:3.0, readThroughputGBs:60,  writeThroughputGBs:20,  clientNet:'100', fabricType:'RoCEv2', notes:'VAST CSI available on OperatorHub. Supports RWX and RWO.' },

    'backup-archive':   { name:'Backup & Archive',       reductionRatio:5.0, readThroughputGBs:20,  writeThroughputGBs:30,  clientNet:'25',  fabricType:'RoCEv2', notes:'High compression on backup streams; WORM for compliance.' },

    'openstack':        { name:'OpenStack',              reductionRatio:3.5, readThroughputGBs:50,  writeThroughputGBs:20,  clientNet:'100', fabricType:'RoCEv2', notes:'Cinder block + Manila file; NVMe/TCP requires VastOS 5.3+.' },

    'media-vfx':        { name:'Media & VFX',            reductionRatio:1.5, readThroughputGBs:100, writeThroughputGBs:30,  clientNet:'100', fabricType:'RoCEv2', notes:'Large sequential I/O; low compression ratio on already-compressed media.' },

    'hybrid-dr':        { name:'Hybrid / DR',            reductionRatio:3.0, readThroughputGBs:80,  writeThroughputGBs:30,  clientNet:'100', fabricType:'RoCEv2', notes:'Async/sync VAST Mirror replication; WAN bandwidth planning critical.' },

    'database-analytics':{ name:'Database / Analytics',  reductionRatio:4.5, readThroughputGBs:80,  writeThroughputGBs:60,  clientNet:'100', fabricType:'RoCEv2', notes:'High write rate with strong compression on structured data.' },

    'file-share':       { name:'Enterprise File Shares', reductionRatio:3.5, readThroughputGBs:40,  writeThroughputGBs:15,  clientNet:'100', fabricType:'RoCEv2', notes:'Mixed NFS/SMB workload; good all-round data reduction.' }

  }

};





/* ── KB version helpers ─ always read from live PRODUCT_CATALOG ── */

function _kbVer() {
  var versions = PRODUCT_CATALOG.vastosVersions || [];
  if (!versions.length) return '5.5.0';
  /* Prefer entry with latest:true, otherwise use the last entry */
  var tagged = versions.filter(function(v){ return v.latest; });
  return tagged.length ? tagged[tagged.length-1].version : versions[versions.length-1].version;
}

function _kbCsiVer() {

  return (PRODUCT_CATALOG.csiDriverVersion || 'v2.x');

}



// ============================================================

// === SECTION 3: WIZARD ENGINE ===

// ============================================================



const AppState = {

  currentStep: 1, totalSteps: 10, visitedSteps: new Set([1]),

  config: {

    id: null, name: 'New VAST Design',

    created: new Date().toISOString(), modified: new Date().toISOString(),

    sizing: {

      deploymentType:'on-prem', cloudVendor:'aws', workloadProfile:'ai-training',

      targetUsableTB:500, capacityUnit:'TB', reductionRatio:3.0,

      readThroughputGBs:40, writeThroughputGBs:10, clientNet:'100', fabricType:'RoCEv2',

      haConfig:true, replicationTargetType:'none', remoteCloudVendor:'aws',

      remoteTargetUsableTB:500, remoteCapacityUnit:'TB', remoteWorkloadProfile:'file-share',

      remoteReductionRatio:3.0, remoteMirrorMode:'active-passive', remoteMirrorJournalRatio:20,

      wanChangeRate:10, wanSyncWindow:4, wanPeakFactor:1.3,

      coldTierEnabled:false, coldTierUsableTB:200, coldTierReduction:2.0, coldTierProvider:'aws', coldTierClass:'cool'

    },

    network: { mgmtSubnet:'192.168.10.0/24', backendSubnet:'172.16.100.0/22', frontendSubnet:'10.100.20.0/24', vlanFrontend:120, vlanBackend:990 },

    provisioning: {

      clusterName:'vast-storage-01', dns:'10.100.20.10', ntp:'10.100.20.11', syslog:'10.100.20.12',

      vipStart:'10.100.20.100', vipEnd:'10.100.20.119', vipMask:24, vipGateway:'10.100.20.1',

      vipPolicy:'round-robin', protoNfs3:true, protoNfs4:true, protoSmb:true, protoS3:true, protoNvme:false,

      nfsSquash:'no-squash', authSource:'local', viewPath:'/data/ai_models', quotaTB:250,

      qosMaxBW:'10', qosMaxIOPS:'100k'

    },

    results: { cnodeCount:4, dnodeCount:2, cboxCount:1, switchCount:2, effectiveTB:500, physicalTB:166.7, rawTB:171.8, scmTB:12.8, ru:10, powerW:3200, heatBTU:10918, weightKg:136, readThroughputGBs:40, writeThroughputGBs:10, dboxModel:'ceres-df3015' }

  },

  autoSaveTimer: null

};



function switchStep(n) {

  const total = AppState.totalSteps;

  if (n < 1 || n > total) return;

  document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));

  document.querySelectorAll('.wizard-panel').forEach(el => el.classList.remove('active'));

  if (AppState.currentStep !== n) AppState.visitedSteps.add(AppState.currentStep);

  AppState.currentStep = n;

  AppState.visitedSteps.add(n);

  const ni = document.querySelector('.step-item[data-step="' + n + '"]');

  const np = document.getElementById('panel-' + n);

  if (ni) ni.classList.add('active');

  if (np) np.classList.add('active');

  const prev = document.getElementById('prev-btn');

  const next = document.getElementById('next-btn');

  if (prev) prev.disabled = (n === 1);

  if (next) next.disabled = (n === total);

  updateSidebarProgress();

  // Update step counter display

  const stepCounter = document.getElementById('step-counter');

  if (stepCounter) stepCounter.textContent = n + ' / ' + total;

  // Trigger appropriate generators when reaching each stage

  if (n === 5) generateNetworkConfig();

  if (n === 6) generateVcliCommands();

  if (n === 7) renderIntegrationConfigs();

  if (n >= 8) generateAllDocuments();

  const ws = document.querySelector('.workspace');

  if (ws) ws.scrollTop = 0;

}



function navigateStep(dir) { switchStep(AppState.currentStep + dir); }



function markStepCompleted(n) {

  const item = document.querySelector('.step-item[data-step="' + n + '"]');

  if (item) item.classList.add('completed');

}



function updateSidebarProgress() {

  document.querySelectorAll('.step-item').forEach(item => {

    const step = parseInt(item.dataset.step, 10);

    if (step === AppState.currentStep) {

      item.classList.add('active'); item.classList.remove('completed');

    } else if (AppState.visitedSteps.has(step)) {

      item.classList.remove('active'); item.classList.add('completed');

    } else {

      item.classList.remove('active', 'completed');

    }

  });

}



// ============================================================

// === SECTION 4: SIZING ENGINE ===

// ============================================================



const DBOX_SPECS = {

  'ceres-df3015':    { rawTB:344.4, scmTB:6.4,  ruSize:1, powerW:1600, weightKg:18 },

  'ceres-df3060':    { rawTB:1364,  scmTB:12,   ruSize:1, powerW:1600, weightKg:20 },

  'ebox-supermicro': { rawTB:30,    scmTB:1,    ruSize:2, powerW:1200, weightKg:22 },

  'ebox-cisco':      { rawTB:25,    scmTB:1,    ruSize:2, powerW:1100, weightKg:20 }

};

const CNODE_READ_GBS  = 50;   // GB/s sequential read per stateless CNode

const CNODE_WRITE_GBS = 10;   // GB/s sequential write per CNode

const CNODE_MIN       = 4;    // Minimum cluster quorum size

const EC_OVERHEAD     = 1.027; // VAST 150+4 erasure code = 2.67% overhead



function calculateSizing() {

  const targetUsableRaw    = parseFloat(_getVal('target-usable'))           || 500;

  const capacityUnit       = _getSelect('capacity-unit')                    || 'TB';

  const targetUsableTB     = capacityUnit === 'PB' ? targetUsableRaw * 1024 : targetUsableRaw;

  const reductionRatio     = parseFloat(_getVal('reduction-ratio'))          || 3.0;

  const readThroughputGBs  = parseFloat(_getVal('read-throughput'))          || 40;

  const writeThroughputGBs = parseFloat(_getVal('write-throughput'))         || 10;

  const clientNet          = _getSelect('client-net')                       || '100';

  const fabricType         = _getSelect('fabric-type')                      || 'RoCEv2';

  const haConfig           = _getCheck('ha-config')                         ?? true;

  const workloadProfile    = _getSelect('workload-profile')                 || 'ai-training';

  const deploymentType     = _getSelect('deployment-type')                  || 'on-prem';

  const replicationTarget  = _getSelect('replication-target-type')          || 'none';

  const coldEnabled        = _getCheck('cold-tier-enabled')                 ?? false;



  Object.assign(AppState.config.sizing, { targetUsableTB, capacityUnit, reductionRatio, readThroughputGBs, writeThroughputGBs, clientNet, fabricType, haConfig, workloadProfile, deploymentType, replicationTargetType:replicationTarget, coldTierEnabled:coldEnabled });



  const physicalTB = targetUsableTB / reductionRatio;

  const rawTB      = physicalTB * EC_OVERHEAD;

  const dboxModel  = rawTB > 2000 ? 'ceres-df3060' : 'ceres-df3015';

  const dboxSpec   = DBOX_SPECS[dboxModel];



  let dnodeCount = Math.ceil(rawTB / dboxSpec.rawTB);

  if (haConfig && dnodeCount % 2 !== 0) dnodeCount++;

  if (dnodeCount < 2) dnodeCount = 2;

  const scmTB = dboxSpec.scmTB * dnodeCount;



  let cnodeCount = Math.max(Math.ceil(readThroughputGBs / CNODE_READ_GBS), Math.ceil(writeThroughputGBs / CNODE_WRITE_GBS), CNODE_MIN);

  cnodeCount = Math.ceil(cnodeCount / 4) * 4;

  const cboxCount = Math.ceil(cnodeCount / 4);

  const switchCount = 2;



  const cnodeRU = cboxCount * 2;

  const dnodeRU = dnodeCount * dboxSpec.ruSize;

  const totalRU = cnodeRU + dnodeRU + 2 + 2;

  const powerW  = (cnodeCount * 800) + (dnodeCount * dboxSpec.powerW) + (switchCount * 400) + 300;

  const heatBTU = Math.round(powerW * 3.412);

  const weightKg= (cboxCount * 25) + (dnodeCount * dboxSpec.weightKg) + (switchCount * 15);

  const effectiveTB = targetUsableTB;



  const results = { cnodeCount, dnodeCount, switchCount, cboxCount, effectiveTB, physicalTB, rawTB, scmTB, ru:totalRU, powerW, heatBTU, weightKg, dboxModel, dboxSpec, readThroughputGBs, writeThroughputGBs };

  AppState.config.results = results;



  _setText('cnode-count',        cnodeCount);

  _setText('cnode-model',        'VAST CBox (' + cboxCount + ' chassis x 4 C-nodes)');

  _setText('dnode-count',        dnodeCount);

  _setText('dnode-model',        dboxModel === 'ceres-df3060' ? 'VAST Ceres DF-3060V2 (1U)' : 'VAST Ceres DF-3015V2 (1U)');

  _setText('switch-count',       switchCount);

  _setText('switch-fabric-name', fabricType === 'IB' ? 'InfiniBand NDR Switches' : '100/200GbE RoCEv2 Switches');

  _setText('sum-effective', effectiveTB.toFixed(1) + ' TB');

  _setText('sum-physical',  physicalTB.toFixed(1)  + ' TB');

  _setText('sum-raw',       rawTB.toFixed(1)       + ' TB');

  _setText('sum-scm',       scmTB.toFixed(2)       + ' TB');

  _setText('footprint-ru',    totalRU + ' RU');

  _setText('footprint-power', powerW.toLocaleString() + ' W');

  _setText('footprint-heat',  heatBTU.toLocaleString() + ' BTU/hr');



  const preset = PRODUCT_CATALOG.workloadPresets[workloadProfile];

  _setText('final-workload',      preset ? preset.name : workloadProfile);

  _setText('final-cnodes',        cnodeCount);

  _setText('final-dnodes',        dnodeCount);

  _setText('final-fabric',        '2x Switches (' + fabricType + ')');

  _setText('final-ru',            totalRU + ' RU');

  _setText('final-power',         powerW.toLocaleString() + ' W');

  _setText('final-cap-usable',    effectiveTB.toFixed(1) + ' TB');

  _setText('final-cap-reduction', reductionRatio.toFixed(1) + ':1');

  _setText('final-cap-raw',       rawTB.toFixed(1) + ' TB');

  _setText('final-cap-scm',       scmTB.toFixed(2) + ' TB');

  _setText('final-perf-read',     readThroughputGBs + ' GB/s');

  _setText('final-perf-write',    writeThroughputGBs + ' GB/s');

  const dateEl = document.getElementById('final-date');

  if (dateEl) dateEl.textContent = 'Generated: ' + new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

  const titleEl = document.getElementById('final-cluster-title');

  if (titleEl) titleEl.textContent = _getVal('prov-cluster-name') || 'vast-storage-01';

  _setText('final-net-mgmt', _getVal('net-mgmt-subnet') || '192.168.10.0/24');

  _setText('final-net-back', _getVal('net-backend-subnet') || '172.16.100.0/22');

  _setText('final-net-vip',  (_getVal('prov-vip-start') || '10.100.20.100') + ' - ' + (_getVal('prov-vip-end') || '10.100.20.119'));

  _setText('final-view-path',  _getVal('prov-view-path') || '/data');

  _setText('final-view-quota', (_getVal('prov-quota-gb') || 250) + ' TB');

  const qbw = _getSelect('prov-qos-max-bw') || 'unlimited';

  _setText('final-view-qos', qbw === 'unlimited' ? 'Unlimited' : qbw + ' GB/s');

  const protos = [];

  if (_getCheck('proto-nfs3')) protos.push('NFSv3');

  if (_getCheck('proto-nfs4')) protos.push('NFSv4.1');

  if (_getCheck('proto-smb'))  protos.push('SMB 3.x');

  if (_getCheck('proto-s3'))   protos.push('S3 REST');

  if (_getCheck('proto-nvme')) protos.push('NVMe/TCP');

  _setText('final-view-protos', protos.join(', ') || 'None selected');



  const replEnabled = replicationTarget !== 'none';

  _showHide('remote-site-sizing-group',  replEnabled);

  _showHide('remote-site-summary',       replEnabled);

  _showHide('wan-link-summary',          replEnabled);

  _showHide('remote-cloud-vendor-group', replicationTarget === 'public-cloud');

  _showHide('cloud-vendor-group',        deploymentType !== 'on-prem');

  _showHide('cloud-network-card',        deploymentType === 'cloud');

  _showHide('physical-cabling-card',     deploymentType !== 'cloud');

  _showHide('cold-tier-details-group',   coldEnabled);

  _showHide('cold-tier-summary',         coldEnabled);

  if (replEnabled) _calculateRemoteSite(replicationTarget);

  if (coldEnabled) {

    const cu = parseFloat(_getVal('cold-tier-usable')) || 200;

    const cr = parseFloat(_getVal('cold-tier-reduction')) || 2.0;

    const pv = _getSelect('cold-tier-provider') || 'aws';

    const cl = _getSelect('cold-tier-class') || 'cool';

    const pl = {aws:'AWS S3',azure:'Azure Blob',gcp:'GCS','onprem-s3':'On-Prem S3'}[pv] || pv;

    const tl = {standard:'Standard',cool:'Cool (90-day)',archive:'Archive/Glacier'}[cl] || cl;

    _setText('sum-cold-provider',  pl + ' (' + tl + ')');

    _setText('sum-cold-effective', cu.toFixed(1) + ' TB');

    _setText('sum-cold-raw',       (cu/cr).toFixed(1) + ' TB');

  }

  _updateMountCommands();

  generateBOM(results);

  generateFirewallMatrix();

}



function _calculateRemoteSite(targetType) {

  const auto    = _getCheck('remote-auto-size') ?? true;

  const rUsable = auto ? (parseFloat(_getVal('target-usable')) || 500) : (parseFloat(_getVal('remote-target-usable')) || 500);

  const rUnit   = auto ? (_getSelect('capacity-unit') || 'TB') : (_getSelect('remote-capacity-unit') || 'TB');

  const rTB     = rUnit === 'PB' ? rUsable * 1024 : rUsable;

  const rRed    = parseFloat(_getVal('remote-reduction-ratio')) || 3.0;

  const jRatio  = parseFloat(_getVal('remote-mirror-journal-ratio')) || 20;

  const rawTB   = (rTB / rRed) * EC_OVERHEAD * (1 + jRatio / 100);

  const dm      = rawTB > 2000 ? 'ceres-df3060' : 'ceres-df3015';

  const sp      = DBOX_SPECS[dm];

  let dc        = Math.ceil(rawTB / sp.rawTB);

  if (dc % 2 !== 0) dc++;

  if (dc < 2) dc = 2;

  const cc = Math.max(4, Math.ceil(AppState.config.sizing.readThroughputGBs / 2 / CNODE_READ_GBS) * 4);

  _setText('remote-cnode-count', cc);

  _setText('remote-cnode-model', 'VAST CBox');

  _setText('remote-dnode-count', dc);

  _setText('remote-dnode-model', dm === 'ceres-df3060' ? 'VAST Ceres DF-3060V2' : 'VAST Ceres DF-3015V2');

  _setText('remote-switch-count', 2);

  _setText('remote-switch-fabric-name', '100GbE RoCEv2');

  _setText('sum-remote-effective', rTB.toFixed(1) + ' TB');

  _setText('sum-remote-raw',      rawTB.toFixed(1) + ' TB');

  _setText('sum-remote-scm',      (sp.scmTB * dc).toFixed(2) + ' TB');

  const badge = document.getElementById('remote-site-type-badge');

  if (badge) { badge.textContent = targetType === 'public-cloud' ? 'Remote Cloud' : 'Remote On-Prem'; badge.style.backgroundColor = targetType === 'public-cloud' ? 'var(--accent-violet)' : 'var(--accent-amber)'; }

  const cr = parseFloat(_getVal('wan-change-rate')) || 10;

  const sw = parseFloat(_getVal('wan-sync-window')) || 4;

  const pf = parseFloat(_getSelect('wan-peak-factor')) || 1.3;

  const dd = rTB * (cr / 100);

  const bw = (dd * 8 * 1000) / (sw * 3600) * pf;

  const rl = bw < 2 ? '1 Gbps' : bw < 8 ? '10 Gbps' : bw < 80 ? '100 Gbps' : '400 Gbps';

  _setText('sum-wan-daily-delta',   dd.toFixed(1) + ' TB');

  _setText('sum-wan-sync-window',   sw + ' Hours');

  _setText('sum-wan-est-bandwidth', bw.toFixed(2) + ' Gbps');

  _setText('sum-wan-rec-link-speed', rl + ' (Port)');

}



function adjustWorkloadDefaults() {

  const profile = _getSelect('workload-profile') || 'ai-training';

  const preset  = PRODUCT_CATALOG.workloadPresets[profile];

  if (!preset) return;

  _setVal('reduction-ratio', preset.reductionRatio);

  _setVal('read-throughput', preset.readThroughputGBs);

  _setVal('write-throughput', preset.writeThroughputGBs);

  _setVal('client-net', preset.clientNet);

  _setVal('fabric-type', preset.fabricType);

  updateReductionSlider(); updateReadSlider(); updateWriteSlider();

  calculateSizing();

}



function adjustRemoteWorkloadDefaults() {

  const p = PRODUCT_CATALOG.workloadPresets[_getSelect('remote-workload-profile') || 'file-share'];

  if (p) _setVal('remote-reduction-ratio', p.reductionRatio);

  calculateSizing();

}



function toggleRemoteAutoSize() {

  const auto = _getCheck('remote-auto-size') ?? true;

  ['remote-target-usable','remote-capacity-unit'].forEach(id => { const el = document.getElementById(id); if (el) el.disabled = auto; });

  calculateSizing();

}



function updateReductionSlider() { _setText('reduction-val',     (parseFloat(_getVal('reduction-ratio')) || 3.0).toFixed(1) + ':1'); calculateSizing(); }

function updateReadSlider()      { _setText('read-throughput-val',  (parseFloat(_getVal('read-throughput'))  || 40) + ' GB/s'); calculateSizing(); }

function updateWriteSlider()     { _setText('write-throughput-val', (parseFloat(_getVal('write-throughput')) || 10) + ' GB/s'); calculateSizing(); }



// ============================================================

// === SECTION 5: NETWORK ENGINE ===

// ============================================================



function _parseCidr(cidr) {

  const p = (cidr || '192.168.10.0/24').split('/');

  return { octets: p[0].split('.').map(Number), prefix: parseInt(p[1] || '24', 10) };

}



function _nthIP(cidr, n) {

  const { octets } = _parseCidr(cidr);

  const base = ((octets[0]||0)<<24)|((octets[1]||0)<<16)|((octets[2]||0)<<8)|(octets[3]||0);

  const host = (base + n) >>> 0;

  return [(host>>>24)&255,(host>>>16)&255,(host>>>8)&255,host&255].join('.');

}



function generateNetworkConfig() { calculatePorts(); }



function calculatePorts() {

  const r   = AppState.config.results;

  const cc  = r.cnodeCount || 4;

  const dc  = r.dnodeCount || 2;

  const ms  = _getVal('net-mgmt-subnet')     || '192.168.10.0/24';

  const bs  = _getVal('net-backend-subnet')  || '172.16.100.0/22';

  const fs  = _getVal('net-frontend-subnet') || '10.100.20.0/24';

  const vf  = _getVal('net-vlan-id')         || '120';

  const vb  = _getVal('net-vlan-backend')    || '990';

  const fab = _getSelect('fabric-type')      || 'RoCEv2';

  const fl  = fab === 'IB' ? 'InfiniBand NDR' : 'RoCEv2';



  const tbody = document.getElementById('port-map-tbody');

  if (!tbody) return;

  const rows = [];



  rows.push(_portRow('OOB Mgmt Switch','Port 1 (1GbE)','Admin Network Uplink','Management','1','1500',_nthIP(ms,1)));

  for (let c=1; c<=cc; c++) {

    const lb='C-Node '+c;

    rows.push(_portRow(lb,'IPMI / BMC',          'OOB Mgmt Switch - Port '+(c+1),                      'Management',vf,'1500',_nthIP(ms,10+c)));

    rows.push(_portRow(lb,'eth0 (Frontend)',      'Client Switch - Port '+((c-1)*2+1),                  'Frontend',  vf,'9000',_nthIP(fs,20+c)));

    rows.push(_portRow(lb,'eth1 (Frontend)',      'Client Switch - Port '+((c-1)*2+2),                  'Frontend',  vf,'9000',_nthIP(fs,52+c)));

    rows.push(_portRow(lb,'eth2 (Backend A)',     'Fabric Switch A - Port '+((c-1)*2+1),                'Backend',   vb,'9000',_nthIP(bs,100+(c-1)*4)));

    rows.push(_portRow(lb,'eth3 (Backend A)',     'Fabric Switch A - Port '+((c-1)*2+2),                'Backend',   vb,'9000',_nthIP(bs,100+(c-1)*4+1)));

    rows.push(_portRow(lb,'eth4 (Backend B)',     'Fabric Switch B - Port '+((c-1)*2+1),                'Backend',   vb,'9000',_nthIP(bs,100+(c-1)*4+2)));

    rows.push(_portRow(lb,'eth5 (Backend B)',     'Fabric Switch B - Port '+((c-1)*2+2),                'Backend',   vb,'9000',_nthIP(bs,100+(c-1)*4+3)));

  }

  for (let d=1; d<=dc; d++) {

    const lb='D-Node '+d;

    const bb=100+cc*4+(d-1)*4;

    rows.push(_portRow(lb,'IPMI / BMC',           'OOB Mgmt Switch - Port '+(cc+d+1),                  'Management',vb,'1500',_nthIP(ms,10+cc+d)));

    rows.push(_portRow(lb,'D-Tray A ('+fl+')',    'Fabric Switch A - Port '+(cc*2+(d-1)*2+1),          'Backend',   vb,'9000',_nthIP(bs,bb)));

    rows.push(_portRow(lb,'D-Tray A ('+fl+')',    'Fabric Switch A - Port '+(cc*2+(d-1)*2+2),          'Backend',   vb,'9000',_nthIP(bs,bb+1)));

    rows.push(_portRow(lb,'D-Tray B ('+fl+')',    'Fabric Switch B - Port '+(cc*2+(d-1)*2+1),          'Backend',   vb,'9000',_nthIP(bs,bb+2)));

    rows.push(_portRow(lb,'D-Tray B ('+fl+')',    'Fabric Switch B - Port '+(cc*2+(d-1)*2+2),          'Backend',   vb,'9000',_nthIP(bs,bb+3)));

  }

  rows.push(_portRow('Fabric Switch A','Mgmt Port (1GbE)', 'OOB Mgmt Switch - Port '+(cc+dc+2),'Management','1','1500',_nthIP(ms,5)));

  rows.push(_portRow('Fabric Switch B','Mgmt Port (1GbE)', 'OOB Mgmt Switch - Port '+(cc+dc+3),'Management','1','1500',_nthIP(ms,6)));

  rows.push(_portRow('Fabric Switch A','ISL Port 32','Fabric Switch B - Port 32 (ISL)','Backend',vb,'9000','--'));

  rows.push(_portRow('Fabric Switch B','ISL Port 32','Fabric Switch A - Port 32 (ISL)','Backend',vb,'9000','--'));



  tbody.innerHTML = rows.join('');

  renderCablingDiagram(cc, dc);

  generateLLDPreview(cc, dc, ms, bs, fs, vf, vb, fab);

}



function _portRow(component, port, destination, domain, vlan, mtu, ip) {

  const cols = {Management:'#10B981',Frontend:'#38BDF8',Backend:'#6366F1'};

  const col  = cols[domain] || '#94A3B8';

  return '<tr><td style="font-weight:600;color:#E2E8F0;">'+component+'</td><td style="font-family:monospace;font-size:0.8rem;">'+port+'</td><td style="color:var(--color-text-secondary);font-size:0.85rem;">'+destination+'</td><td><span style="display:inline-block;padding:2px 8px;border-radius:4px;background:'+col+'22;color:'+col+';font-size:0.75rem;font-weight:600;">'+domain+'</span></td><td style="font-family:monospace;text-align:center;">'+vlan+'</td><td style="font-family:monospace;text-align:center;">'+mtu+'</td><td style="font-family:monospace;color:var(--accent-teal);">'+ip+'</td></tr>';

}



function renderCablingDiagram(cnodeCount, dnodeCount) {

  const svg = document.getElementById('cabling-svg');

  if (!svg) return;

  const nW=120, nH=38, W=700, colStart=40, colEnd=W-40-nW;

  const maxCols = Math.max(cnodeCount, dnodeCount, 2);

  const step = maxCols > 1 ? (colEnd-colStart)/(maxCols-1) : (colEnd-colStart)/2;

  const cY=90, swY=185, dY=280, topSwY=18;

  const swAx=colStart+(colEnd-colStart)*0.25, swBx=colStart+(colEnd-colStart)*0.75;

  const clientSwX=30, mgmtSwX=W-30-nW;

  const cx = i => colStart + i * step;

  let h='';

  for(let c=0;c<cnodeCount;c++){const x=cx(c)+nW/2;h+='<path d="M'+(clientSwX+nW/2)+','+(topSwY+nH)+' L'+x+','+cY+'" class="svg-cable active client-cables" stroke="#38BDF8" stroke-width="1.5"/>';}

  for(let c=0;c<cnodeCount;c++){const x=cx(c)+nW/2;h+='<path d="M'+(mgmtSwX+nW/2)+','+(topSwY+nH)+' L'+x+','+cY+'" class="svg-cable active mgmt-cables" stroke="#10B981" stroke-width="1.2" stroke-dasharray="5,3"/>';}

  for(let d=0;d<dnodeCount;d++){const x=cx(d)+nW/2;h+='<path d="M'+(mgmtSwX+nW/2)+','+(topSwY+nH)+' L'+x+','+dY+'" class="svg-cable active mgmt-cables" stroke="#10B981" stroke-width="1.2" stroke-dasharray="5,3"/>';}

  for(let c=0;c<cnodeCount;c++){const x=cx(c)+nW/2;h+='<path d="M'+x+','+(cY+nH)+' L'+(swAx+nW/2)+','+swY+'" class="svg-cable active backend-cables" stroke="#6366F1" stroke-width="1.5"/>';h+='<path d="M'+x+','+(cY+nH)+' L'+(swBx+nW/2)+','+swY+'" class="svg-cable active backend-cables" stroke="#6366F1" stroke-width="1.5"/>';}

  for(let d=0;d<dnodeCount;d++){const x=cx(d)+nW/2;h+='<path d="M'+x+','+dY+' L'+(swAx+nW/2)+','+(swY+nH)+'" class="svg-cable active backend-cables" stroke="#6366F1" stroke-width="1.5"/>';h+='<path d="M'+x+','+dY+' L'+(swBx+nW/2)+','+(swY+nH)+'" class="svg-cable active backend-cables" stroke="#6366F1" stroke-width="1.5"/>';}

  h+='<path d="M'+(swAx+nW)+','+(swY+nH/2)+' L'+swBx+','+(swY+nH/2)+'" class="svg-cable active backend-cables" stroke="#6366F1" stroke-width="2" stroke-dasharray="6,3"/>';

  const nd=(x,y,lbl,sub,sc)=>'<rect x="'+x+'" y="'+y+'" width="'+nW+'" height="'+nH+'" class="svg-node" fill="#0D1321" stroke="'+sc+'" rx="3"/><text x="'+(x+nW/2)+'" y="'+(y+15)+'" text-anchor="middle" class="svg-text">'+lbl+'</text><text x="'+(x+nW/2)+'" y="'+(y+27)+'" text-anchor="middle" class="svg-text-sub">'+sub+'</text>';

  h+='<rect x="'+clientSwX+'" y="'+topSwY+'" width="'+nW+'" height="'+nH+'" class="svg-node" fill="#1E293B" stroke="#38BDF8" rx="3"/><text x="'+(clientSwX+nW/2)+'" y="'+(topSwY+15)+'" text-anchor="middle" class="svg-text">Client Switch</text><text x="'+(clientSwX+nW/2)+'" y="'+(topSwY+27)+'" text-anchor="middle" class="svg-text-sub">L3 Frontend</text>';

  h+='<rect x="'+mgmtSwX+'" y="'+topSwY+'" width="'+nW+'" height="'+nH+'" class="svg-node" fill="#1E293B" stroke="#10B981" rx="3"/><text x="'+(mgmtSwX+nW/2)+'" y="'+(topSwY+15)+'" text-anchor="middle" class="svg-text">OOB Mgmt Sw</text><text x="'+(mgmtSwX+nW/2)+'" y="'+(topSwY+27)+'" text-anchor="middle" class="svg-text-sub">1GbE IPMI</text>';

  for(let c=0;c<cnodeCount;c++) h+=nd(cx(c),cY,'C-Node '+(c+1),c===0?'Lead Protocol':'Protocol Node','#10B981');

  h+=nd(swAx,swY,'Fabric Sw A','RoCEv2 Rail 1','#6366F1');

  h+=nd(swBx,swY,'Fabric Sw B','RoCEv2 Rail 2','#6366F1');

  for(let d=0;d<dnodeCount;d++) h+=nd(cx(d),dY,'D-Node '+(d+1),'SCM + QLC SSD','#F59E0B');

  svg.innerHTML=h;

}



function highlightCables(type) {

  document.querySelectorAll('.svg-cable').forEach(c => {

    if (c.classList.contains(type+'-cables')) { c.style.opacity='1'; c.style.strokeWidth='3'; }

    else { c.style.opacity='0.1'; }

  });

}



function resetCables() {

  document.querySelectorAll('.svg-cable').forEach(c => { c.style.opacity='1'; c.style.strokeWidth=''; });

}



// ============================================================

// === SECTION 6: VCLI GENERATOR ===

// ============================================================



function generateVcliCommands() {

  const container = document.getElementById('vcli-output-container');

  if (!container) return;

  const style   = _getSelect('vcli-format-style') || 'bash-prefix';

  const explain = _getCheck('vcli-show-explanations') ?? true;

  const px      = style === 'bash-prefix' ? 'vcli ' : '';

  const clN     = _getVal('prov-cluster-name')  || 'vast-storage-01';

  const dns     = _getVal('prov-dns')           || '10.100.20.10';

  const ntp     = _getVal('prov-ntp')           || '10.100.20.11';

  const syslog  = _getVal('prov-syslog')        || '10.100.20.12';

  const vipS    = _getVal('prov-vip-start')     || '10.100.20.100';

  const vipE    = _getVal('prov-vip-end')       || '10.100.20.119';

  const vipM    = _getVal('prov-vip-mask')      || '24';

  const vipGw   = _getVal('prov-vip-gateway')   || '10.100.20.1';

  const vipP    = _getSelect('prov-vip-policy') || 'round-robin';

  const squash  = _getSelect('prov-nfs-squash') || 'no-squash';

  const auth    = _getSelect('prov-auth-source')|| 'local';

  const vPath   = _getVal('prov-view-path')     || '/data/ai_models';

  const quota   = parseInt(_getVal('prov-quota-gb') || '250', 10);

  const qbw     = _getSelect('prov-qos-max-bw') || 'unlimited';

  const qiops   = _getSelect('prov-qos-max-iops') || 'unlimited';

  const n3 = _getCheck('proto-nfs3') ?? true;

  const n4 = _getCheck('proto-nfs4') ?? true;

  const sm = _getCheck('proto-smb')  ?? true;

  const s3 = _getCheck('proto-s3')   ?? true;

  const nv = _getCheck('proto-nvme') ?? false;

  const vl = _getVal('net-vlan-id')  || '120';



  const cmt = t => '<span class="terminal-comment"># ' + t + '</span>\n';

  const cmd = c => '<span class="terminal-cmd">' + px + c + '</span>';

  const par = (p, v) => '<span class="terminal-param"> ' + p + '</span><span class="terminal-val"> ' + v + '</span>';



  let o = '';



  o += cmt('=================================================================');

  o += cmt('SECTION 1 -- CLUSTER INITIALIZATION');

  o += cmt('=================================================================');

  if (explain) o += cmt('Sets cluster identity and configures infrastructure service endpoints.');

  o += cmd('cluster set') + par('--name', clN) + par('--dns', dns) + par('--ntp', ntp) + par('--syslog', syslog) + '\n';



  o += '\n' + cmt('=================================================================');

  o += cmt('SECTION 2 -- VIP POOL CREATION');

  o += cmt('=================================================================');

  if (explain) o += cmt('Virtual IPs float between C-Nodes. New clients distributed per policy.');

  o += cmd('vip-pool create') + par('--name','vip-pool-01') + par('--vip-start-ip',vipS) + par('--vip-end-ip',vipE) + par('--subnet-mask','/'+vipM) + par('--gateway',vipGw) + par('--vip-vlan',vl) + par('--ip-distribution-policy',vipP) + '\n';



  o += '\n' + cmt('=================================================================');

  o += cmt('SECTION 3 -- VIEW POLICY (ACCESS CONTROLS)');

  o += cmt('=================================================================');

  if (explain) o += cmt('Policy defines protocols, squash behavior, and auth for exports.');

  o += cmd('viewpolicy create') + par('--name','policy-default') + par('--vip-pools','vip-pool-01') + par('--nfs3',n3?'on':'off') + par('--nfs41',n4?'on':'off') + par('--smb',sm?'on':'off') + par('--s3',s3?'on':'off') + par('--nvme',nv?'on':'off') + par('--nfs-no-squash',squash==='no-squash'?'true':'false') + par('--nfs-root-squash',squash==='root-squash'?'true':'false') + par('--nfs-all-squash',squash==='all-squash'?'true':'false') + '\n';

  if (auth === 'ldap') {

    if (explain) o += cmt('LDAP provides centralized POSIX UID/GID mapping and Kerberos support.');

    o += cmd('ldap create') + par('--name','ad-ldap') + par('--domain','corp.example.com') + par('--servers','192.168.10.20') + par('--base-dn','DC=corp,DC=example,DC=com') + par('--binddn',"'CN=vastbind,OU=ServiceAccounts,DC=corp,DC=example,DC=com'") + par('--bind-password',"'<REPLACE_BIND_PASSWORD>'") + '\n';

  }



  o += '\n' + cmt('=================================================================');

  o += cmt('SECTION 4 -- VIEW CREATION (DATA PATH EXPORT)');

  o += cmt('=================================================================');

  if (explain) o += cmt('Views expose VAST filesystem namespace as protocol-accessible endpoints.');

  o += cmd('view create') + par('--path',vPath) + par('--policy-name','policy-default') + par('--create-dir','true') + '\n';

  if (quota > 0) {

    if (explain) o += cmt('Quota hard limit enforces maximum capacity for this export path.');

    o += cmd('quota create') + par('--path',vPath) + par('--hard-limit',quota*1024*1024*1024*1024) + par('--unit','bytes') + '\n';

  }



  o += '\n' + cmt('=================================================================');

  o += cmt('SECTION 5 -- QoS POLICY');

  o += cmt('=================================================================');

  if (qbw !== 'unlimited' || qiops !== 'unlimited') {

    if (explain) o += cmt('QoS prevents workload starvation. BW in MB/s; IOPS are raw counts.');

    o += cmd('qos-policy create') + par('--name','qos-default');

    if (qbw !== 'unlimited')  o += par('--read-bw-limit', (parseInt(qbw,10)*1024)+'MB');

    if (qiops !== 'unlimited') o += par('--read-iops-limit', qiops.replace('k','000'));

    o += '\n';

    o += cmd('view update') + par('--path',vPath) + par('--qos-policy-name','qos-default') + '\n';

  } else {

    o += cmt('QoS: No limits -- cluster operates at maximum performance.');

  }



  o += '\n' + cmt('=================================================================');

  o += cmt('SECTION 6 -- SNAPSHOT PROTECTION POLICY');

  o += cmt('=================================================================');

  if (explain) o += cmt('Near-zero-overhead CoW snapshots for RPO. Schedule = cron expression.');

  o += cmd('protection-policy create') + par('--name','snap-hourly') + par('--prefix','auto') + par('--indestructible','false') + par('--schedule','"0 * * * *"') + '\n';

  o += cmd('view update') + par('--path',vPath) + par('--protection-policy-name','snap-hourly') + '\n';



  if (s3) {

    o += '\n' + cmt('=================================================================');

    o += cmt('SECTION 7 -- S3 BUCKET CONFIGURATION');

    o += cmt('=================================================================');

    if (explain) o += cmt('VAST S3 is AWS SDK-compatible. Bucket maps directly to a view path.');

    o += cmd('s3-bucket create') + par('--name',clN+'-bucket') + par('--path',vPath) + '\n';

    o += cmd('s3-user create') + par('--name','s3admin') + par('--bucket',clN+'-bucket') + par('--access-key',"'<ACCESS_KEY>'") + par('--secret-key',"'<SECRET_KEY>'") + par('--policy','ReadWrite') + '\n';

  }



  o += '\n' + cmt('=================================================================');

  o += cmt('SECTION 8 -- POST-PROVISIONING VALIDATION');

  o += cmt('=================================================================');

  if (explain) o += cmt('Run these commands to confirm cluster health before client access.');

  ['cluster list','cnode list','dnode list','vip-pool list','view list','quota list','protection-policy list'].forEach(c => { o += cmd(c)+'\n'; });

  if (s3) o += cmd('s3-bucket list')+'\n';



  container.innerHTML = o;

  _updateMountCommands();

}



// ============================================================

// === SECTION 7: DOCUMENT ENGINE ===

// ============================================================



function generateBOM(results) {

  // HTML panel 9 uses id="bom-tbody"; fallback to sizing-bom-tbody for backward compat

  const tbody = document.getElementById('bom-tbody') ||

                document.getElementById('sizing-bom-tbody');

  if (!tbody) return;



  const r  = results || AppState.config.results;

  const cc = r.cnodeCount  || 4;

  const dc = r.dnodeCount  || 2;

  const cx = r.cboxCount   || Math.ceil(cc/4);

  const dm = r.dboxModel   || 'ceres-df3015';

  const sc = r.switchCount || 2;

  const ru = r.ru          || 10;

  const rc = Math.ceil(ru/38);

  const bc = (cc*4)+(dc*4)+2;  // backend cables: 4 per CNode, 4 per DNode, 2 ISL

  const fc = cc*2;             // frontend cables: 2 per CNode

  const mc = cc+dc+4;          // mgmt cables: 1 per node + switch mgmt ports

  const dn = {

    'ceres-df3015':'VAST Ceres DF-3015V2 (1U - 338TB QLC + 6.4TB SCM)',

    'ceres-df3060':'VAST Ceres DF-3060V2 (1U - 1352TB QLC + 12TB SCM)',

    'ebox-supermicro':'VAST EBox Supermicro AS-2115GT-HNTF',

    'ebox-cisco':'VAST EBox Cisco UCS C845A M8'

  }[dm] || dm;

  let ln=1;

  const rows=[

    _bomRow(ln++,'VAST-CBOX-STD',   'VAST CBox Standard (4x CNode chassis, 2U)', 'Compute',   cx,  'Chassis','AMD EPYC Turin 64-core, 384GB DDR5/node, 4x200GbE NICs per node'),

    _bomRow(ln++,dm.toUpperCase(),  dn,                                           'Storage',   dc,  'Unit',   'BlueField-3 DPU D-Trays, QLC NVMe + SCM write buffer, redundant PSU'),

    _bomRow(ln++,'SW-BACKEND-A',    'Backend Fabric Switch A (100/200GbE RoCEv2)','Networking',1,   'Unit',   'PFC+ECN lossless; MTU 9214; VLAN '+(_getVal('net-vlan-backend')||'990')+' trunked'),

    _bomRow(ln++,'SW-BACKEND-B',    'Backend Fabric Switch B (100/200GbE RoCEv2)','Networking',1,   'Unit',   'Identical to Switch A; ISL cable between pair for redundancy'),

    _bomRow(ln++,'SW-FRONTEND',     'Frontend/Client Switch (L3 25/100GbE)',      'Networking',1,   'Unit',   'Customer-provided or VAST-recommended; SVI for VIP gateway required'),

    _bomRow(ln++,'SW-OOB-MGMT',     'OOB Management Switch (1GbE)',               'Networking',1,   'Unit',   'IPMI/BMC access for all nodes; isolated from data plane network'),

    _bomRow(ln++,'CBL-QSFP28-BACK', '100GbE QSFP28 DAC/AOC Backend Cables',      'Cabling',   bc,  'Cable',  'C-Node eth2-5 and D-Node D-Tray ports to both fabric switches + ISL'),

    _bomRow(ln++,'CBL-QSFP28-FRONT','100GbE QSFP28 DAC/AOC Frontend Cables',     'Cabling',   fc,  'Cable',  'C-Node eth0/eth1 to client switch uplink ports'),

    _bomRow(ln++,'CBL-RJ45-MGMT',   '1GbE Cat6A Patch Cables (OOB Management)',  'Cabling',   mc,  'Cable',  'IPMI BMC ports on all nodes + switch management interfaces'),

    _bomRow(ln++,'RACK-42U-PDU',    '42U Equipment Rack with dual PDU',           'Facility',  rc,  'Rack',   'Total cluster ~'+ru+' RU; 10% growth headroom recommended'),

    _bomRow(ln++,'VAST-AI-OS-LIC',  'VAST AI OS License (VastOS '+_kbVer()+')',      'Software',  1,   'Bundle', 'Included with hardware; cluster-locked; includes VMS, REST API, VCLI'),

    _bomRow(ln++,'VAST-CSI-DRIVER', 'VAST CSI Driver for Kubernetes (open source)','Software', 1,   'Free',   'github.com/vast-data/vast-csi - listed on OperatorHub for OpenShift')

  ];

  // ── Replication rows (conditional) ─────────────────────────────────────────
  var _bReplEnabled = _getCheck('bc-enable-replication') ||
                      (_getSelect('replication-target-type') &&
                       _getSelect('replication-target-type') !== 'none');
  if (_bReplEnabled) {
    var _bReplTgt = _getSelect('bc-remote-site-type') || _getSelect('replication-target-type') || 'vast-onprem';
    var _bReplMode= _getSelect('bc-replication-type') === 'sync' ? 'Synchronous' : 'Asynchronous';
    var _bRpoMin  = _getVal('bc-rpo-minutes') || '15';
    rows.push(_bomRow(ln++, 'VAST-MIRROR-LIC',
      'VAST Mirror Replication License (included with AI OS)',
      'Software', 1, 'Included',
      'Enables async/sync ' + _bReplMode + ' replication. RPO target: ' + _bRpoMin + ' min. Managed via VAST VMS and VCLI.'));
    if (_bReplTgt === 'vast-onprem' || _bReplTgt === 'none') {
      rows.push(_bomRow(ln++, 'WAN-CIRCUIT-REF',
        'WAN / MPLS Circuit (customer-provided, for reference)',
        'Networking', 1, 'Reference',
        'Required bandwidth: daily-change-rate / RPO-window. Configured WAN: ' + (_getVal('bc-wan-bandwidth') || '10') + ' Gbps available.'));
      rows.push(_bomRow(ln++, 'DR-VAST-CLUSTER-REF',
        'DR Site VAST Cluster (secondary cluster, sized separately)',
        'Hardware', 1, 'Reference',
        'Secondary VAST cluster at DR site required. Configure with identical Views, VIP pool, and auth settings. See BC/DR Runbook.'));
    } else {
      rows.push(_bomRow(ln++, 'CLOUD-MIRROR-ENDPOINT',
        'Cloud Replication Endpoint (' + ({'aws':'Amazon S3','azure':'Azure Blob','gcp':'GCP Storage'}[_bReplTgt] || 'Cloud') + ')',
        'Software', 1, 'Subscription',
        'VAST Mirror to cloud requires outbound HTTPS (TCP 443) from all C-Nodes to cloud storage endpoint.'));
    }
  }

  // ── Cold tier rows (conditional) ───────────────────────────────────────────
  var _bTierEnabled = _getCheck('cold-tier-enabled') || _getCheck('tier-enable');
  if (_bTierEnabled) {
    var _bTierPrv = _getSelect('cold-tier-provider') || _getSelect('tier-provider') || 'aws';
    var _bTierPrvLbl = {'aws':'Amazon S3','azure':'Azure Blob Storage','gcp':'Google Cloud Storage','onprem':'On-Premises S3 (MinIO)'}[_bTierPrv] || 'Cloud Object Storage';
    var _bTierTB  = _getVal('cold-tier-usable') || '—';
    var _bTierCls = {'cool':'Cool / IA','cold':'Cold / Glacier','archive':'Archive'}[_getSelect('cold-tier-class')] || 'Cool';
    rows.push(_bomRow(ln++, 'COLD-TIER-STORAGE',
      'Cloud Cold Tier Storage — ' + _bTierPrvLbl + ' (' + _bTierCls + ')',
      'Software', 1, 'Subscription',
      _bTierTB + ' TB cold capacity target. Billed per GB by cloud provider. Policy: ' + (_getSelect('tier-policy') || 'capacity') + '-based. Requires outbound TCP 443 from C-Nodes.'));
    rows.push(_bomRow(ln++, 'COLD-TIER-LICENSE',
      'VAST DataStore Cold Tiering License (included with AI OS)',
      'Software', 1, 'Included',
      'Cloud tiering is a built-in VAST AI OS feature. No additional software license required.'));
  }

  // ── Replication firewall rules (conditional) ───────────────────────────────
  var _fwReplEnabled = _getCheck('bc-enable-replication') ||
                       (_getSelect('replication-target-type') &&
                        _getSelect('replication-target-type') !== 'none');
  if (_fwReplEnabled) {
    var _fwReplTgt   = _getSelect('bc-remote-site-type') || _getSelect('replication-target-type') || 'vast-onprem';
    var _fwReplMode  = _getSelect('bc-replication-type') === 'sync' ? 'Sync' : 'Async';
    var _fwRemoteIP  = _getVal('prov-remote-mgmt-ip') || '<DR-MGMT-IP>';
    if (_fwReplTgt === 'vast-onprem' || _fwReplTgt === 'none') {
      rows.push(_fwRow('C-Nodes (' + mg + ')', 'DR VAST VMS (' + _fwRemoteIP + ')', 'Primary -> DR Site', 'TCP', '443', 'VAST Mirror ' + _fwReplMode + ' replication — data + control over HTTPS management channel'));
      rows.push(_fwRow('DR VAST VMS (' + _fwRemoteIP + ')', 'C-Nodes (' + mg + ')', 'DR Site -> Primary', 'TCP', '443', 'VAST Mirror reverse path — DR cluster polls primary for replication health'));
    } else {
      var _fwCloudEP = {'aws':'s3.amazonaws.com (regional endpoint)','azure':'*.blob.core.windows.net','gcp':'storage.googleapis.com'}[_fwReplTgt] || 'cloud-endpoint';
      rows.push(_fwRow('C-Nodes (' + mg + ')', _fwCloudEP, 'Outbound -> Cloud', 'TCP', '443', 'VAST Mirror to cloud target (' + _fwReplTgt.toUpperCase() + ') — encrypted HTTPS replication stream'));
    }
  }

  // ── Cold tier firewall rules (conditional) ──────────────────────────────────
  var _fwTierEnabled = _getCheck('cold-tier-enabled') || _getCheck('tier-enable');
  if (_fwTierEnabled) {
    var _fwTierPrv = _getSelect('cold-tier-provider') || _getSelect('tier-provider') || 'aws';
    var _fwTierEP  = {'aws':'s3.amazonaws.com / s3.<region>.amazonaws.com','azure':'*.blob.core.windows.net','gcp':'storage.googleapis.com','onprem':'<On-Prem S3 Endpoint>'}[_fwTierPrv] || 'cloud-storage-endpoint';
    rows.push(_fwRow('C-Nodes (' + mg + ')', _fwTierEP, 'Outbound -> Cloud', 'TCP', '443', 'VAST Cloud Tiering data transfer — HTTPS PUT/GET for cold object storage (' + _fwTierPrv.toUpperCase() + ')'));
  }

  tbody.innerHTML=rows.join('');

}



function _bomRow(ln,part,desc,cat,qty,unit,notes) {

  const cc={Compute:'#10B981',Storage:'#F59E0B',Networking:'#6366F1',Cabling:'#94A3B8',Facility:'#94A3B8',Software:'#38BDF8'}[cat]||'#94A3B8';

  return '<tr><td style="text-align:center;color:var(--color-text-muted);">'+ln+'</td><td style="font-family:monospace;font-size:0.78rem;color:var(--accent-teal);">'+part+'</td><td style="font-size:0.85rem;">'+desc+'</td><td><span style="padding:2px 7px;border-radius:4px;background:'+cc+'22;color:'+cc+';font-size:0.75rem;font-weight:600;">'+cat+'</span></td><td style="text-align:center;font-weight:700;color:#E2E8F0;">'+qty+'</td><td style="text-align:center;color:var(--color-text-muted);">'+unit+'</td><td style="font-size:0.78rem;color:var(--color-text-secondary);">'+notes+'</td></tr>';

}



// Alias called from HTML button onclick="exportFirewallMatrix()"

// Generates the firewall matrix and then exports it as CSV text

function exportFirewallMatrix() {

  generateFirewallMatrix(); // populate the table first

  const tbody = document.getElementById('firewall-matrix-tbody') || document.getElementById('firewall-tbody');

  if (!tbody) { showToast('Firewall matrix not yet generated.', 'error'); return; }

  const rows = Array.from(tbody.querySelectorAll('tr'));

  const header = 'Source,Destination,Port/Protocol,Service,Direction,Notes\n';

  const csv = header + rows.map(row =>

    Array.from(row.querySelectorAll('td')).map(td => '"' + (td.textContent || '').replace(/"/g, '""').trim() + '"').join(',')

  ).filter(r => r !== '').join('\n');

  downloadText(csv, _buildFilename('Firewall-Matrix', 'csv'));

  showToast('Firewall matrix exported as CSV.', 'success');

}



function generateFirewallMatrix() {



  const tbody = document.getElementById('firewall-matrix-tbody');

  if (!tbody) return;

  const vs  = _getVal('prov-vip-start') || '10.100.20.100';

  const as  = _getSelect('prov-auth-source') || 'local';

  const bk  = _getVal('net-backend-subnet')  || '172.16.100.0/22';

  const mg  = _getVal('net-mgmt-subnet')     || '192.168.10.0/24';

  const fr  = _getVal('net-frontend-subnet') || '10.100.20.0/24';

  const nt  = _getVal('prov-ntp')    || '10.100.20.11';

  const dn  = _getVal('prov-dns')    || '10.100.20.10';

  const sl  = _getVal('prov-syslog') || '10.100.20.12';

  const n3 = _getCheck('proto-nfs3') ?? true;

  const n4 = _getCheck('proto-nfs4') ?? true;

  const sm = _getCheck('proto-smb')  ?? true;

  const s3 = _getCheck('proto-s3')   ?? true;

  const nv = _getCheck('proto-nvme') ?? false;

  const rows=[];

  if(n3||n4){rows.push(_fwRow('Client Systems','VAST VIPs ('+fr+')','Any -> VIP range','TCP','2049','NFS data traffic (NFSv3 and NFSv4.1 mounts)'));rows.push(_fwRow('Client Systems','VAST VIPs ('+fr+')','Any -> VIP range','TCP/UDP','111','Portmapper / rpcbind (NFSv3 required)'));}

  if(sm) rows.push(_fwRow('Client Systems','VAST VIPs ('+fr+')','Any -> VIP range','TCP','445','SMB 3.1.1 / CIFS protocol (Windows file access)'));

  if(s3) rows.push(_fwRow('Client Systems','VAST VIPs ('+fr+')','Any -> VIP range','TCP','80 / 443','S3 REST API (HTTP and HTTPS endpoints)'));

  if(nv) rows.push(_fwRow('Client Systems','VAST VIPs ('+fr+')','Any -> VIP range','TCP','4420','NVMe/TCP block protocol (VastOS 5.2+)'));

  rows.push(_fwRow('Admin Systems','VMS ('+fr+')','Admin hosts -> VMS','TCP','443','VAST VMS Web UI (HTTPS) and REST API management'));

  rows.push(_fwRow('Admin Systems','C-Node 1 ('+fr+')','Admin hosts -> Lead','TCP','22','SSH -- VCLI interactive shell for provisioning'));

  rows.push(_fwRow('C-Nodes ('+bk+')','C-Nodes ('+bk+')','C-Node <-> C-Node','TCP','8888','Internal cluster coordination and health gossip bus'));

  rows.push(_fwRow('C-Nodes ('+bk+')','C-Nodes ('+bk+')','C-Node <-> C-Node','TCP','9090','Metadata and state propagation channel'));

  rows.push(_fwRow('C-Nodes ('+bk+')','D-Nodes ('+bk+')','C-Node -> D-Node','UDP','4791','RoCEv2 RDMA NVMe-oF transport (MUST be lossless with PFC)'));

  rows.push(_fwRow('C-Nodes ('+bk+')','D-Nodes ('+bk+')','C-Node -> D-Node','TCP','8009','BlueField-3 DPU management and telemetry interface'));

  rows.push(_fwRow('C-Nodes ('+mg+')','telemetry.vast.ai','C-Node -> Internet','TCP','443','VAST CallHome telemetry and support diagnostics (proxiable)'));

  rows.push(_fwRow('C-Nodes ('+mg+')','NTP: '+nt,'C-Node -> NTP','UDP','123','NTP time sync -- critical for erasure coding stripe consistency'));

  rows.push(_fwRow('C-Nodes ('+mg+')','DNS: '+dn,'C-Node -> DNS','TCP/UDP','53','Hostname resolution for cluster and protocol operations'));

  rows.push(_fwRow('C-Nodes ('+mg+')','Syslog: '+sl,'C-Node -> Syslog','UDP','514','Audit and event log forwarding to SIEM'));

  if(as==='ldap'){rows.push(_fwRow('C-Nodes ('+mg+')','AD/LDAP Server','C-Node -> LDAP','TCP/UDP','389','LDAP directory for POSIX UID/GID mapping'));rows.push(_fwRow('C-Nodes ('+mg+')','AD/LDAP Server','C-Node -> LDAPS','TCP','636','LDAP over TLS (LDAPS) -- recommended for production'));rows.push(_fwRow('C-Nodes ('+mg+')','AD KDC','C-Node -> Kerberos','TCP/UDP','88','Kerberos TGT for NFSv4.1 sec=krb5 authentication'));}

  tbody.innerHTML=rows.join('');

}



function _fwRow(src,dst,range,proto,port,purpose) {

  return '<tr><td style="font-size:0.8rem;color:var(--accent-teal);">'+src+'</td><td style="font-size:0.8rem;">'+dst+'</td><td style="font-size:0.78rem;color:var(--color-text-muted);">'+range+'</td><td style="text-align:center;font-family:monospace;font-size:0.8rem;">'+proto+'</td><td style="text-align:center;font-family:monospace;font-weight:700;color:#F59E0B;">'+port+'</td><td style="font-size:0.78rem;color:var(--color-text-secondary);">'+purpose+'</td></tr>';

}



function generateLLDPreview(cc, dc, ms, bs, fs, vf, vb, fab) {

  const container = document.getElementById('lld-preview-container');

  if (!container) return;

  const clN = _getVal('prov-cluster-name') || 'vast-storage-01';

  const vipS= _getVal('prov-vip-start')    || '10.100.20.100';

  const vipE= _getVal('prov-vip-end')      || '10.100.20.119';

  let ipRows='';

  for(let c=1;c<=cc;c++){

    ipRows+=_ipRow(clN+'-cnode'+c+'-bmc',  'C-Node','IPMI BMC',   _nthIP(ms,10+c),          '1', '1500','Management');

    ipRows+=_ipRow(clN+'-cnode'+c+'-fe0',  'C-Node','Frontend 0', _nthIP(fs,20+c),           vf,  '9000','Frontend');

    ipRows+=_ipRow(clN+'-cnode'+c+'-bea0', 'C-Node','Backend A-0',_nthIP(bs,100+(c-1)*4),    vb,  '9000','Backend');

    ipRows+=_ipRow(clN+'-cnode'+c+'-beb0', 'C-Node','Backend B-0',_nthIP(bs,100+(c-1)*4+2),  vb,  '9000','Backend');

  }

  for(let d=1;d<=dc;d++){

    ipRows+=_ipRow(clN+'-dnode'+d+'-bmc',  'D-Node','IPMI BMC',  _nthIP(ms,10+cc+d),                 '1', '1500','Management');

    ipRows+=_ipRow(clN+'-dnode'+d+'-dtra', 'D-Node','D-Tray A',  _nthIP(bs,100+cc*4+(d-1)*4),        vb,  '9000','Backend');

    ipRows+=_ipRow(clN+'-dnode'+d+'-dtrb', 'D-Node','D-Tray B',  _nthIP(bs,100+cc*4+(d-1)*4+2),      vb,  '9000','Backend');

  }

  container.innerHTML=

    '<div style="margin-bottom:1.5rem;"><h4 style="color:var(--accent-teal);margin-bottom:0.75rem;">Cluster: '+clN+' -- IP Address Allocation</h4>'+

    '<div class="table-container"><table class="cabling-table" style="font-size:0.8rem;"><thead><tr><th>Hostname</th><th>Role</th><th>Interface</th><th>IP Address</th><th>VLAN</th><th>MTU</th><th>Network</th></tr></thead><tbody>'+ipRows+'</tbody></table></div></div>'+

    '<div style="margin-bottom:1.5rem;"><h4 style="color:var(--accent-teal);margin-bottom:0.75rem;">Backend Switch RoCEv2 Config (Arista EOS)</h4>'+

    '<div style="background:#0D1321;border:1px solid var(--panel-border);border-radius:6px;padding:1rem;font-family:monospace;font-size:0.78rem;color:#94A3B8;line-height:1.7;overflow-x:auto;">'+

    '<span style="color:#10B981;"># Apply to both Fabric Switch A and B</span><br>'+

    '<span style="color:#38BDF8;">interface</span> Ethernet1-'+(cc*2+dc*2)+'<br>&nbsp;&nbsp;<span style="color:#38BDF8;">description</span> VAST-Backend-Fabric<br>&nbsp;&nbsp;<span style="color:#38BDF8;">switchport mode</span> trunk<br>&nbsp;&nbsp;<span style="color:#38BDF8;">switchport trunk allowed vlan</span> '+vb+'<br>&nbsp;&nbsp;<span style="color:#38BDF8;">mtu</span> 9214<br>&nbsp;&nbsp;<span style="color:#38BDF8;">no shutdown</span><br><span style="color:#38BDF8;">!</span><br>'+

    '<span style="color:#10B981;"># Enable PFC for lossless RDMA (CoS 3)</span><br><span style="color:#38BDF8;">dcbx mode</span> CEE<br><span style="color:#38BDF8;">priority-flow-control mode</span> on<br><span style="color:#38BDF8;">priority-flow-control priority</span> 3 no-drop<br>'+

    '<span style="color:#10B981;"># ECN for DCQCN congestion control (RoCEv2)</span><br><span style="color:#38BDF8;">queue-monitor ecn dscp</span> 24 threshold 500000<br>'+

    '<span style="color:#38BDF8;">vlan</span> '+vf+'<br>&nbsp;&nbsp;<span style="color:#38BDF8;">name</span> VAST-Frontend-VIPs<br><span style="color:#38BDF8;">vlan</span> '+vb+'<br>&nbsp;&nbsp;<span style="color:#38BDF8;">name</span> VAST-Backend-Fabric<br></div></div>'+

    '<div><h4 style="color:var(--accent-teal);margin-bottom:0.75rem;">Network Summary</h4>'+

    '<div class="summary-row"><span class="summary-label">VIP Range:</span><span class="summary-val" style="font-family:monospace;">'+vipS+' to '+vipE+'</span></div>'+

    '<div class="summary-row"><span class="summary-label">Frontend VLAN:</span><span class="summary-val">'+vf+'</span></div>'+

    '<div class="summary-row"><span class="summary-label">Backend VLAN:</span><span class="summary-val">'+vb+'</span></div>'+

    '<div class="summary-row"><span class="summary-label">Backend MTU:</span><span class="summary-val">9000 (Jumbo Frames -- required for NVMe-oF)</span></div>'+

    '<div class="summary-row"><span class="summary-label">Fabric Protocol:</span><span class="summary-val">'+(fab==='IB'?'InfiniBand NDR (200/400Gb)':'RoCEv2 Ethernet (100/200GbE)')+'</span></div></div>';

}



function _ipRow(hostname,role,iface,ip,vlan,mtu,net) {

  return '<tr><td style="font-family:monospace;font-size:0.78rem;color:var(--accent-teal);">'+hostname+'</td><td>'+role+'</td><td>'+iface+'</td><td style="font-family:monospace;color:#E2E8F0;">'+ip+'</td><td style="text-align:center;">'+vlan+'</td><td style="text-align:center;">'+mtu+'</td><td style="color:var(--color-text-muted);">'+net+'</td></tr>';

}



function generateProposal() {

  // Target the actual doc container IDs from the HTML

  const container = document.getElementById('prop-content-executive-doc') ||

                    document.getElementById('prop-content-executive');

  if (!container) return;

  const clN = _getVal('prov-cluster-name') || 'vast-storage-01';

  const res = AppState.config.results;

  const cc  = res.cnodeCount || 4;

  const dc  = res.dnodeCount || 2;

  const eTB = res.effectiveTB || 500;

  const rr  = AppState.config.sizing.reductionRatio || 3.0;

  const auth= _getSelect('prov-auth-source') || 'local';

  const wp  = _getSelect('workload-profile') || 'ai-training';

  const wpN = (PRODUCT_CATALOG.workloadPresets[wp] || {}).name || 'Enterprise Storage';

  const today = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});

  const protos=[];

  if(_getCheck('proto-nfs3'))protos.push('NFSv3');

  if(_getCheck('proto-nfs4'))protos.push('NFSv4.1');

  if(_getCheck('proto-smb'))protos.push('SMB 3.1.1');

  if(_getCheck('proto-s3'))protos.push('S3 REST');

  if(_getCheck('proto-nvme'))protos.push('NVMe/TCP');

  const protocols=protos.join(', ')||'None configured';

  container.innerHTML=

    '<div style="font-family:Inter,sans-serif;line-height:1.8;color:#CBD5E1;">'+

    '<div style="border-left:4px solid var(--accent-teal);padding:1rem 1.5rem;background:rgba(16,185,129,0.06);border-radius:0 8px 8px 0;margin-bottom:2rem;">'+

      '<div style="font-size:1.4rem;font-weight:700;color:#FFF;margin-bottom:0.25rem;">VAST Data Enterprise Storage Architecture Proposal</div>'+

      '<div style="font-size:0.85rem;color:var(--color-text-muted);">Cluster: <strong style="color:var(--accent-teal);">'+clN+'</strong> | Generated: '+today+' | Classification: Confidential</div>'+

      '<div style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.4rem;">VAST AI OS '+_kbVer()+' (Latest GA) | DASE Architecture | 150+4 Erasure Coding (2.67% overhead)</div>'+

    '</div>'+

    '<h3 style="color:var(--accent-teal);font-size:1.1rem;margin-bottom:0.75rem;">1. Executive Summary</h3>'+

    '<p style="margin-bottom:1rem;">This proposal presents a VAST Data all-flash storage cluster delivering <strong>'+eTB.toFixed(0)+' TB usable capacity</strong> for <strong>'+wpN+'</strong> workloads. The solution comprises <strong>'+cc+' C-Nodes</strong> (stateless compute) and <strong>'+dc+' D-Nodes</strong> (QLC NVMe storage), achieving <strong>'+rr.toFixed(1)+':1 data reduction</strong> via VAST global similarity-based compression. Any C-Node can access any byte on any D-Node with microsecond latency over the NVMe-oF backend fabric.</p>'+

    '<p style="margin-bottom:1.5rem;">Unlike traditional storage architectures, VAST\'s DASE model eliminates metadata bottlenecks, enabling linear performance scaling, zero-downtime upgrades, and transparent failover without client disruption.</p>'+

    '<h3 style="color:var(--accent-teal);font-size:1.1rem;margin-bottom:0.75rem;">2. Security Architecture</h3>'+

    '<p style="margin-bottom:0.75rem;">All data at rest: <strong>AES-256 DARE</strong>. VAST AI OS is <strong>FIPS 140-3 certified</strong>. External KMS via KMIP 2.0 supported (HashiCorp Vault, Thales, etc.).</p>'+

    '<ul style="margin-left:1.5rem;margin-bottom:1.5rem;color:var(--color-text-secondary);">'+

      '<li><strong>NFS Kerberos:</strong> NFSv4.1 sec=krb5/krb5i/krb5p with AD KDC integration</li>'+

      '<li><strong>SMB 3.1.1:</strong> AES-GCM encryption + mandatory signing per share</li>'+

      '<li><strong>WORM / Compliance:</strong> Per-view immutable retention (SEC 17a-4, FINRA, HIPAA)</li>'+

      '<li><strong>Multi-tenancy:</strong> Isolated VIP pools, view policies, namespace segmentation</li>'+

      '<li><strong>Audit Logging:</strong> File-level audit to SIEM via syslog RFC 5424</li>'+

      '<li><strong>Auth:</strong> '+(auth==='ldap'?'Active Directory / LDAP with automatic SID-to-POSIX mapping (RFC 2307)':'Local auth; AD/LDAP available for production')+'</li>'+

    '</ul>'+

    '<h3 style="color:var(--accent-teal);font-size:1.1rem;margin-bottom:0.75rem;">3. Regulatory Compliance</h3>'+

    '<div class="table-container" style="margin-bottom:1.5rem;"><table class="cabling-table" style="font-size:0.82rem;"><thead><tr><th>Framework</th><th>VAST Capability</th><th>Control Mapping</th></tr></thead><tbody>'+

      '<tr><td>HIPAA / HITECH</td><td>DARE AES-256, Audit Logging, WORM</td><td>SS164.312(a)(2)(iv) Encryption; SS164.312(b) Audit</td></tr>'+

      '<tr><td>GDPR / EU NIS2</td><td>Data encryption, access controls, deletion</td><td>Art.25 Privacy by Design; Art.32 Technical Measures</td></tr>'+

      '<tr><td>SOC 2 Type II</td><td>RBAC, audit logs, HA, DARE, VMS controls</td><td>CC6.1 Logical Access; CC7.2 Anomaly; A1.1 Availability</td></tr>'+

      '<tr><td>PCI DSS v4.0</td><td>VLAN segmentation, SMB signing, DARE, key rotation</td><td>Req.3.5 Crypto; Req.8.2 Unique IDs; Req.10 Logging</td></tr>'+

      '<tr><td>FIPS 140-3</td><td>Validated modules in VAST AI OS (AES-256-GCM, SHA-384)</td><td>Platform-wide FIPS mode</td></tr>'+

      '<tr><td>ISO 27001</td><td>Access policies, incident logging, BCP/DR replication</td><td>Annex A.8; A.9; A.12</td></tr>'+

    '</tbody></table></div>'+

    '<h3 style="color:var(--accent-teal);font-size:1.1rem;margin-bottom:0.75rem;">4. Enabled Protocols</h3>'+

    '<p style="margin-bottom:1rem;"><strong style="color:#FFF;">'+protocols+'</strong></p>'+

    '<h3 style="color:var(--accent-teal);font-size:1.1rem;margin-bottom:0.75rem;">5. High Availability Architecture</h3>'+

    '<p style="margin-bottom:1rem;">C-Nodes are stateless; any failure is transparent -- VIPs migrate within seconds. VAST 150+4 erasure coding tolerates 4 simultaneous drive failures with 2.67% overhead (vs. 33-50% for RAID-6). D-Nodes connect active/active via dual D-Trays to both fabric switches for no single point of failure.</p>'+

    '<ul style="margin-left:1.5rem;color:var(--color-text-secondary);">'+

      '<li>Snapshot RPO: Minutes (near-instantaneous CoW snapshots)</li>'+

      '<li>Replication: Async/sync mirror to remote VAST cluster or cloud target</li>'+

      '<li>Non-disruptive Upgrades: Rolling VastOS upgrades with zero client impact</li>'+

      '<li>C-Node Scale-out: Add CBox without downtime; joins cluster within 10 minutes</li>'+

    '</ul>'+

    '<div style="margin-top:2rem;padding:1rem;border:1px dashed rgba(99,102,241,0.4);border-radius:8px;background:rgba(99,102,241,0.04);font-size:0.82rem;color:var(--color-text-muted);">'+

      '<strong style="color:#6366F1;">CONFIDENTIALITY NOTICE:</strong> Prepared exclusively for named recipient. Distribution without written consent of VAST Data prohibited. Specifications subject to final BOM and site survey.'+

    '</div></div>';

}



function generateDeploymentGuide() {

  // Write to the runbook doc container in the HTML

  const container = document.getElementById('dep-content-runbook-doc') ||

                    document.getElementById('dep-content-runbook');

  if (!container) return;



  const cfg   = AppState.config;

  const p     = cfg.provisioning || {};

  const r     = cfg.results || {};

  const s     = cfg.sizing || {};

  const n     = cfg.network || {};

  const adv   = cfg.advanced || {};

  const clN   = p.clusterName || 'vast-cluster-01';

  const vipS  = p.vipStart    || '10.100.20.100';

  const vipE  = p.vipEnd      || '10.100.20.119';

  const vipM  = p.vipMask     || 24;

  const vipGW = p.vipGateway  || '10.100.20.1';

  const vPath = p.viewPath    || '/data';

  const dns   = p.dns         || '10.100.20.10';

  const ntp   = p.ntp         || '10.100.20.11';

  const syslog= p.syslog      || '10.100.20.12';

  const auth  = p.authSource  || 'local';

  const adDom = p.adDomain    || 'corp.example.com';

  const cc    = r.cnodeCount  || 4;

  const dc    = r.dnodeCount  || 2;

  const rGBs  = r.readThroughputGBs  || s.readThroughputGBs  || 40;

  const wGBs  = r.writeThroughputGBs || s.writeThroughputGBs || 10;

  const pw    = r.powerW || 3200;

  const ru    = r.ru    || 10;

  const vlanFE  = n.vlanFrontend || 20;

  const mtu     = n.mtu          || 9000;

  const orgName = (cfg.customer && cfg.customer.orgName) ? _esc(cfg.customer.orgName) : 'Customer';

  const today   = new Date().toLocaleDateString('en-GB', {year:'numeric',month:'long',day:'numeric'});

  const snapSch = (adv.bcSnapshotSchedule) || 'hourly';

  const snapRet = adv.bcSnapshotRetentionDays || 30;

  const repl    = adv.bcEnabled || false;

  const remoteIP= adv.bcRemoteClusterIP || '<REMOTE-CLUSTER-IP>';

  const dare    = adv.secDare !== false;

  const worm    = adv.secWorm || false;

  const wormRet = adv.secWormRetentionDays || 365;

  const quotaTB = p.quotaTB || 100;

  const snapSchedVCLI = snapSch === 'hourly' ? '1 hour' : snapSch.includes('4') ? '4 hours' : snapSch === 'daily' ? '1 day' : '1 week';

  const nfs3En = p.protoNfs3 !== false;

  const nfs4En = p.protoNfs4 !== false;

  const smbEn  = p.protoSmb  !== false;

  const s3En   = p.protoS3   !== false;

  const nvEn   = p.protoNvme || false;



  const cb = (c) => '<pre style="background:#040608;border:1px solid rgba(99,102,241,0.25);border-radius:6px;padding:0.9rem 1.1rem;font-family:\'JetBrains Mono\',monospace;font-size:0.79rem;color:#10B981;line-height:1.65;margin:0.5rem 0 1rem;overflow-x:auto;white-space:pre;">' + c + '</pre>';

  const h2 = (t) => '<h2 style="color:#10B981;font-size:1.15rem;font-weight:700;margin:2rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.07);">' + t + '</h2>';

  const h3 = (t) => '<h3 style="color:#A7F3D0;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">' + t + '</h3>';

  const note = (t) => '<div style="background:rgba(245,158,11,0.07);border-left:3px solid #F59E0B;border-radius:0 6px 6px 0;padding:0.75rem 1rem;margin:0.75rem 0;font-size:0.84rem;color:#FCD34D;">' + t + '</div>';

  const chk = (items) => '<ul style="margin:0.5rem 0 1rem 1.25rem;color:#9CA3AF;line-height:1.9;">' + items.map(i => '<li>&#9633; ' + i + '</li>').join('') + '</ul>';



  const nfs3MountLine = vipS + ':' + vPath + ' /mnt/vast nfs vers=3,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 0 0';

  const nfs4MountLine = vipS + ':' + vPath + ' /mnt/vast-nfs4 nfs vers=4.1,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 0 0';



  const html = '<div style="font-family:\'Outfit\',Inter,sans-serif;line-height:1.75;color:#CBD5E1;max-width:900px;">'

  + '<div style="border-left:4px solid #6366F1;padding:1rem 1.5rem;background:rgba(99,102,241,0.06);border-radius:0 8px 8px 0;margin-bottom:2rem;">'

  + '<div style="font-size:1.4rem;font-weight:700;color:#FFF;">VAST AI OS &mdash; Full Deployment Runbook</div>'

  + '<div style="font-size:0.85rem;color:#6B7280;">Customer: <strong style="color:#A7F3D0;">' + orgName + '</strong> &bull; Cluster: <strong style="color:#6366F1;">' + clN + '</strong> &bull; ' + cc + 'x C-Nodes / ' + dc + 'x D-Nodes &bull; VAST AI OS '+_kbVer()+'</div>'

  + '<div style="font-size:0.8rem;color:#6B7280;margin-top:0.3rem;">Generated: ' + today + ' | VASTbuilder v2.0</div>'

  + '</div>'

  + '<div style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.84rem;color:#9CA3AF;">'

  + '<strong style="color:#10B981;">References:</strong><br>'

  + 'VAST AI OS Admin Guide: <span style="color:#38BDF8;">https://kb.vastdata.com/</span> &bull; '

  + 'VCLI Reference: Admin Guide &rarr; VMS Interfaces &rarr; CLI Command Reference<br>'

  + 'VAST CSI Driver: <span style="color:#38BDF8;">https://github.com/vast-data/vast-csi</span> &bull; '

  + 'Ansible Playbooks: <span style="color:#38BDF8;">https://github.com/ebeauzec/VASTbuilder/tree/main/ansible</span>'

  + '</div>'

  + h2('Phase 0 &mdash; Pre-Deployment Checklist')

  + note('Complete ALL items before powering on VAST hardware.')

  + chk([

      'Rack space confirmed: minimum <strong>' + ru + ' RU</strong> available',

      'Power circuits: <strong>' + pw.toLocaleString() + ' W</strong> + 20% headroom = <strong>' + Math.ceil(pw*1.2/1000) + ' kW</strong> circuit',

      'Dual PDUs with independent breakers installed and tested',

      'Backend fabric switches: PFC enabled, MTU ' + mtu + ', storage VLAN trunked to all VAST ports',

      'Frontend switch SVI configured for VIP gateway: ' + vipGW,

      'OOB management switch connected to all node BMC/IPMI ports',

      'DNS (' + dns + ') resolves ' + clN + ' &rarr; Lead C-Node management IP',

      'NTP reachable from all VAST nodes: ' + ntp,

      'Syslog server reachable: ' + syslog,

      'Firewall rules applied per Port Matrix (Panel 9 &rarr; Firewall tab)',

      'VAST AI OS ISO downloaded and SHA256-verified from support.vastdata.com',

      'C-Node 1 booted to VAST AI OS installer, management IP assigned',

      'SSH access to C-Node 1 confirmed from jump host'

    ])

  + h2('Phase 1 &mdash; Cluster Bootstrap')

  + h3('1.1 SSH to Lead C-Node')

  + cb('# Connect to Lead C-Node (cnode-01) management IP\nssh admin@\u003cCNODE-1-MGMT-IP\u003e\n\n# Verify all nodes discovered and ONLINE\nvcli admin\u003e node list\n# Expected: ' + cc + ' C-Nodes + ' + dc + ' D-Nodes with status ONLINE\n# If D-Nodes missing: check backend switch VLAN/cable connections')

  + h3('1.2 Cluster Global Settings')

  + cb('vcli admin\u003e cluster modify --cluster-name ' + clN + '\nvcli admin\u003e cluster modify --dns1 ' + dns + '\nvcli admin\u003e cluster modify --ntp1 ' + ntp + '\nvcli admin\u003e cluster modify --syslog-server ' + syslog + '\nvcli admin\u003e cluster show   # verify all settings applied')

  + h2('Phase 2 &mdash; VIP Pool Configuration')

  + note('VIPs are floating IPs served by all CNodes. VAST automatically distributes client connections across the pool.')

  + cb('vcli admin\u003e vippool create \\\n  --name "' + clN + '-vip-pool" \\\n  --start-ip ' + vipS + ' \\\n  --end-ip ' + vipE + ' \\\n  --subnet-prefix ' + vipM + ' \\\n  --gw ' + vipGW + ' \\\n  --role protocols \\\n  --vlan ' + vlanFE + ' \\\n  --lb-method round-robin\n\nvcli admin\u003e vippool list   # verify pool created\n# Ping ' + vipS + ' from a client on the frontend VLAN to verify routing')

  + h2('Phase 3 &mdash; Protocol Enablement')

  + (nfs3En || nfs4En ? h3('3.1 NFS View Policy') + cb('vcli admin\u003e viewpolicy create \\\n  --name "' + clN + '-nfs-policy" \\\n  --nfs-read-only No \\\n  --nfs ' + (nfs4En ? '4' : '3') + ' \\\n  --nfs-squash ' + (p.nfsSquash || 'no-squash') + ' \\\n  --nfs-all-squash No') : '')

  + (smbEn ? h3('3.2 SMB Configuration') + cb('vcli admin\u003e cluster modify --smb-enabled Yes\nvcli admin\u003e cluster modify --smb-signing Required') : '')

  + (s3En ? h3('3.3 S3 Object Storage') + cb('vcli admin\u003e cluster modify --s3-enabled Yes\nvcli admin\u003e s3bucket create --name "' + clN + '-bucket" --view-path ' + vPath + '/s3\nvcli admin\u003e s3accesskey create --account-name s3-admin --role admin\n# S3 endpoint: http://' + vipS + ':9000') : '')

  + (nvEn ? h3('3.4 NVMe/TCP (requires VastOS 5.2+)') + cb('vcli admin\u003e cluster modify --nvme-enabled Yes\nvcli admin\u003e nvme namespace create --name "' + clN + '-ns1" --size 10T --path ' + vPath + '/nvme') : '')

  + (auth !== 'local' ? h2('Phase 4 &mdash; Active Directory / Authentication')

    + cb('vcli admin\u003e activedirectory join \\\n  --domain ' + adDom + ' \\\n  --dc ' + (p.adServer || '\u003cAD-SERVER-IP\u003e') + ' \\\n  --username administrator \\\n  --password "\u003cAD-PASSWORD\u003e"\nvcli admin\u003e activedirectory show   # verify join succeeded') : '')

  + h2('Phase 5 &mdash; Views &amp; Quotas')

  + cb('vcli admin\u003e view create \\\n  --name "' + clN + '-data" \\\n  --path ' + vPath + ' \\\n  --create-dir Yes \\\n  --policy-name "' + clN + '-nfs-policy" \\\n  --vip-pool-name "' + clN + '-vip-pool"\n\n# Quota: ' + quotaTB + 'TB hard / ' + Math.round(quotaTB*0.9) + 'TB soft\nvcli admin\u003e view modify --name "' + clN + '-data" --hard-quota ' + quotaTB + 'T --soft-quota ' + Math.round(quotaTB*0.9) + 'T\nvcli admin\u003e view list   # verify')

  + h2('Phase 6 &mdash; Data Protection')

  + (dare ? cb('# DARE encryption (AES-256-GCM, FIPS 140-3)\nvcli admin\u003e cluster modify --encryption-enabled Yes\n# CRITICAL: Back up encryption keys immediately after enabling') : note('DARE not enabled. Enable post-deployment: <code>vcli admin&gt; cluster modify --encryption-enabled Yes</code>'))

  + (worm ? cb('# WORM compliance (WARNING: irreversible)\nvcli admin\u003e view modify --name "' + clN + '-data" --worm-enabled Yes --worm-minimum-retention ' + wormRet + 'd') : '')

  + h2('Phase 7 &mdash; Snapshots &amp; Replication')

  + cb('vcli admin\u003e protectionpolicy create \\\n  --name "' + clN + '-snap-policy" \\\n  --frame "' + snapSchedVCLI + '" \\\n  --keep-local ' + snapRet + 'd\n\nvcli admin\u003e protectedpath create \\\n  --name "' + clN + '-data-snap" \\\n  --protection-policy-name "' + clN + '-snap-policy" \\\n  --source-dir ' + vPath + '\n\nvcli admin\u003e snapshot list --policy-name "' + clN + '-snap-policy"')

  + (repl ? h3('7b &mdash; DR Replication') + cb('vcli admin\u003e remoteserver create \\\n  --name "' + clN + '-dr-site" \\\n  --mgmt-ip ' + remoteIP + ' \\\n  --access-key \u003cDR-ACCESS-KEY\u003e\n\nvcli admin\u003e protectionpolicy create \\\n  --name "' + clN + '-repl-policy" \\\n  --frame "' + snapSchedVCLI + '" --keep-local 7d --keep-remote 30d \\\n  --remote-server-name "' + clN + '-dr-site" --remote-dir ' + vPath + '\n\nvcli admin\u003e protectedpath list   # monitor replication lag') : '')

  + h2('Phase 8 &mdash; Client Mount Commands')

  + h3('8.1 Linux NFSv3 (AI/ML, HPC &mdash; maximum throughput)')

  + note('<strong>nconnect=8</strong> is mandatory for VAST performance. Single TCP &asymp; 10-12 GB/s. nconnect=8 opens 8 parallel TCP connections, saturating 100GbE. Requires Linux kernel 5.3+ or RHEL 8.3+.')

  + cb('# Install NFS packages\n# RHEL/Rocky: dnf install -y nfs-utils nfs4-acl-tools\n# Ubuntu:     apt install -y nfs-common nfs4-acl-tools\n\nsudo mkdir -p /mnt/vast\nmount -t nfs -o vers=3,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 \\\n  ' + vipS + ':' + vPath + ' /mnt/vast\n\n# /etc/fstab entry (survives reboots):\n' + nfs3MountLine + '\n\n# Performance tuning (persist in /etc/sysctl.d/99-vast-nfs.conf):\nsysctl -w vm.dirty_ratio=20\nsysctl -w net.core.rmem_max=134217728\nsysctl -w net.ipv4.tcp_rmem="4096 87380 134217728"')

  + (nfs4En ? h3('8.2 Linux NFSv4.1 (Secure / Kerberos / POSIX ACLs)')

    + cb('mount -t nfs -o vers=4.1,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 \\\n  ' + vipS + ':' + vPath + ' /mnt/vast-nfs4\n\n# With Kerberos authentication:\nkinit \u003cuser\u003e@' + adDom.toUpperCase() + '\nmount -t nfs -o vers=4.1,sec=krb5i,nconnect=8,rsize=1048576,wsize=1048576,hard \\\n  ' + vipS + ':' + vPath + ' /mnt/vast-krb5') : '')

  + (smbEn ? h3('8.3 Windows SMB')

    + cb('# PowerShell (run as Administrator):\nNew-PSDrive -Name "V" -PSProvider FileSystem -Root "\\\\\\\\' + vipS + '\\\\' + vPath.replace('/','') + '" -Persist\n\n# Command Prompt:\nnet use V: \\\\\\\\' + vipS + '\\\\' + vPath.replace('/','').replace(/\//g,'\\\\') + ' /persistent:yes') : '')

  + (s3En ? h3('8.4 S3 / AWS CLI')

    + cb('aws configure set default.s3.endpoint_url http://' + vipS + ':9000\naws configure set default.s3.max_concurrent_requests 32\naws configure set default.s3.multipart_threshold 64MB\naws s3 ls --endpoint-url http://' + vipS + ':9000') : '')

  + (nvEn ? h3('8.5 NVMe/TCP')

    + cb('nvme discover -t tcp -a ' + vipS + ' -s 4420\nnvme connect -t tcp -a ' + vipS + ' -s 4420 -n nqn.2024-01.com.vastdata:' + clN + '\nnvme list') : '')

  + h2('Phase 9 &mdash; Ansible Automation')

  + note('Full playbooks: <span style="color:#38BDF8;">https://github.com/ebeauzec/VASTbuilder/tree/main/ansible</span>')

  + cb('# Install collections\nansible-galaxy collection install ansible.posix community.general\n\n# Clone and configure\ngit clone https://github.com/ebeauzec/VASTbuilder.git\ncd VASTbuilder/ansible && nano inventory.yml   # edit with your IPs\n\n# Full deployment:\nansible-playbook -i inventory.yml site.yml\n\n# Specific tags:\nansible-playbook -i inventory.yml site.yml --tags nfs_clients\nansible-playbook -i inventory.yml site.yml --tags k8s\n\n# Dry run:\nansible-playbook -i inventory.yml site.yml --check --diff')

  + h2('Phase 10 &mdash; Performance Acceptance Tests')

  + note('Target: &ge; <strong>' + rGBs + ' GB/s</strong> aggregate read, &ge; <strong>' + wGBs + ' GB/s</strong> aggregate write. Run from 2+ clients simultaneously. Reference: <a href="https://fio.readthedocs.io/" style="color:#38BDF8;">fio.readthedocs.io</a>')

  + cb('# Sequential READ (target: >= ' + rGBs + ' GB/s)\nfio --name=vast-seq-read --filename=/mnt/vast/fio-test \\\n    --size=100G --numjobs=32 --rw=read --bs=1M --direct=1 \\\n    --ioengine=libaio --iodepth=64 --group_reporting --runtime=60\n\n# Sequential WRITE (target: >= ' + wGBs + ' GB/s)\nfio --name=vast-seq-write --filename=/mnt/vast/fio-write \\\n    --size=100G --numjobs=32 --rw=write --bs=1M --direct=1 \\\n    --ioengine=libaio --iodepth=64 --group_reporting --runtime=60\n\n# Random 4K READ IOPS\nfio --name=vast-rand-4k --filename=/mnt/vast/fio-rand \\\n    --size=20G --numjobs=16 --rw=randread --bs=4k --direct=1 \\\n    --ioengine=libaio --iodepth=256 --group_reporting --runtime=60')

  + '<div style="margin-top:2.5rem;padding:1rem 1.5rem;background:rgba(99,102,241,0.07);border:1px solid rgba(99,102,241,0.3);border-radius:8px;font-size:0.82rem;color:#94A3B8;">'

  + '<strong style="color:#818CF8;">CONFIDENTIALITY NOTICE:</strong> Generated for ' + orgName + ' by VASTbuilder v2.0. &copy; 2024&ndash;2026 Eugene Beauzec. All Rights Reserved.'

  + '</div></div>';



  container.innerHTML = html;

}



function generateExportPanel() {

  calculateSizing();

  generateBOM();

  generateFirewallMatrix();

  generateProposal(); // populates prop-content-executive-doc

  generateDeploymentGuide(); // populates dep-content-runbook-doc

  // Populate the solution overview tab (panel 8 tab 2)

  const solDoc = document.getElementById('prop-content-solution-doc') ||

                 document.getElementById('prop-content-solution');

  if (solDoc) solDoc.innerHTML = _buildSolutionOverview();

  // Populate the HLD, LLD, ATP and BC/DR doc containers

  const hldDoc = document.getElementById('del-content-hld-doc');

  if (hldDoc) hldDoc.innerHTML = _buildHLD();

  const lldDoc = document.getElementById('del-content-lld-doc');

  if (lldDoc) lldDoc.innerHTML = _buildLLD();

  const atpDoc = document.getElementById('dep-content-atp-doc');

  if (atpDoc) atpDoc.innerHTML = _buildATP();

  const bcdrDoc = document.getElementById('dep-content-bcdr-doc');

  if (bcdrDoc) bcdrDoc.innerHTML = _buildBCDRRunbook();

  _updateMountCommands();

}



// ----- Solution Overview (Panel 8, Tab 2) -----

function _buildSolutionOverview() {

  const cfg = AppState.config;

  const r   = cfg.results || {};

  const s   = cfg.sizing || {};

  const p   = cfg.provisioning || {};

  const org = (cfg.customer && cfg.customer.orgName) ? _esc(cfg.customer.orgName) : 'Customer';

  const latest = PRODUCT_CATALOG.vastosVersions.find(v => v.latest) || { version: _kbVer() };

  const dbox = PRODUCT_CATALOG.dboxModels.find(m => m.id === (s.dboxModel || 'ceres-df3015')) || PRODUCT_CATALOG.dboxModels[0];

  const preset = PRODUCT_CATALOG.workloadPresets[s.workloadProfile || 'ai-ml-training'] || {};

  const protocols = [p.protoNfs3?'NFSv3':'', p.protoNfs4?'NFSv4.1':'', p.protoSmb?'SMB 3.x':'', p.protoS3?'S3':'', p.protoNvme?'NVMe/TCP':''].filter(Boolean);



  return `

  <h2>Solution Architecture Overview</h2>

  <p class="doc-meta">Prepared for: ${org} | VAST AI OS ${_esc(latest.version)} | ${new Date().toLocaleDateString('en-GB', {year:'numeric',month:'long',day:'numeric'})}</p>

  <div class="doc-section">

    <h3>Architecture: Disaggregated Shared-Everything (DASE)</h3>

    <p>The VAST platform uses a disaggregated architecture where stateless compute nodes (CNodes) are completely separated from persistent NVMe storage enclosures (DNodes). All CNodes can access all DNodes simultaneously over a dedicated NVMe-over-Fabrics backend — enabling any node to serve any data with equal latency and eliminating the data ownership bottlenecks present in all traditional storage architectures.</p>

    <div class="highlight-box">

      <strong>Key Principle:</strong> No data migration ever required when scaling. Add CNodes for more performance, add DNodes for more capacity — independently and non-disruptively.

    </div>

  </div>

  <div class="doc-section">

    <h3>Proposed Configuration Summary</h3>

    <table class="cabling-table">

      <thead><tr><th>Parameter</th><th>Value</th></tr></thead>

      <tbody>

        <tr><td>Compute Nodes (CNodes)</td><td>${r.cnodeCount || 4} CNodes (${Math.ceil((r.cnodeCount||4)/4)} CBox chassis)</td></tr>

        <tr><td>Storage Nodes (DNodes)</td><td>${r.dnodeCount || 2}× ${_esc(dbox.name)}</td></tr>

        <tr><td>Usable Capacity</td><td>${(r.effectiveTB || s.targetUsableTB || 500).toFixed(1)} TB (after ${_esc(String(s.reductionRatio || 3.0))}:1 data reduction)</td></tr>

        <tr><td>Raw NVMe Capacity</td><td>${(r.rawTB || 0).toFixed(1)} TB QLC + ${(r.scmTB || 0).toFixed(1)} TB SCM</td></tr>

        <tr><td>Target Read Throughput</td><td>${r.readThroughputGBs || s.readThroughputGBs || 40} GB/s</td></tr>

        <tr><td>Target Write Throughput</td><td>${r.writeThroughputGBs || s.writeThroughputGBs || 10} GB/s</td></tr>

        <tr><td>Backend Fabric</td><td>${_esc(s.fabricType || 'RoCEv2')} @ 200GbE / NDR200</td></tr>

        <tr><td>Client Network</td><td>${_esc(s.clientNet || '100')} GbE Ethernet</td></tr>

        <tr><td>Protocols</td><td>${protocols.join(', ') || 'NFSv3, NFSv4.1, SMB, S3'}</td></tr>

        <tr><td>Rack Space</td><td>${r.ru || 10} RU</td></tr>

        <tr><td>Max Power Draw</td><td>${(r.powerW || 3200).toLocaleString()} W</td></tr>

        <tr><td>Thermal Output</td><td>${(r.heatBTU || 10918).toLocaleString()} BTU/hr</td></tr>

        <tr><td>VAST AI OS</td><td>${_esc(latest.version)} (${(latest.releaseDate || '2026-Q2')})</td></tr>

        ${((_getCheck('bc-enable-replication') || (_getSelect('replication-target-type') && _getSelect('replication-target-type') !== 'none')) ? '<tr><td>Replication</td><td>VAST Mirror ' + (_getSelect('bc-replication-type') === 'sync' ? 'Synchronous' : 'Asynchronous') + ' &rarr; ' + ({'vast-onprem':'Remote VAST Cluster','aws':'AWS','azure':'Azure','gcp':'GCP'}[_getSelect('bc-remote-site-type') || _getSelect('replication-target-type')] || 'Remote Site') + ' (RPO: ' + (_getVal('bc-rpo-minutes') || '15') + ' min)</td></tr>' : '')}

        ${((_getCheck('cold-tier-enabled') || _getCheck('tier-enable')) ? '<tr><td>Cloud Tiering</td><td>' + ({'aws':'Amazon S3','azure':'Azure Blob','gcp':'Google Cloud Storage','onprem':'On-Prem S3'}[_getSelect('cold-tier-provider') || _getSelect('tier-provider')] || 'Cloud Object Storage') + ' — ' + (_getVal('cold-tier-usable') || '—') + ' TB cold capacity</td></tr>' : '')}

      </tbody>

    </table>

  </div>

  <div class="doc-section">

    <h3>Workload Optimisation: ${_esc(preset.name || 'Enterprise Storage')}</h3>

    <p>${_esc(preset.notes || 'VAST is optimized for this workload type with unified multi-protocol access, global namespace, and DASE architecture that scales performance independently of capacity.')}</p>

  </div>

  <div class="doc-section">

    <h3>Data Reduction & Economics</h3>

    <p>VAST applies similarity-based compression, LZ4 fast compression, and global deduplication across all data — achieving a projected <strong>${_esc(String(s.reductionRatio || 3.0))}:1 reduction ratio</strong> for this workload profile. Combined with QLC NVMe flash (the densest and most economical flash tier), VAST delivers all-flash economics at archive-scale capacities.</p>

    <p>Erasure coding uses a 150+4 scheme across the cluster — providing protection against any 4 simultaneous drive failures with only <strong>~2.7% overhead</strong>, compared to 50% for RAID-10 or 33% for RAID-6.</p>

  </div>

  <div class="doc-section">

    <h3>VAST AI OS Feature Highlights</h3>

    <ul>

      ${(latest.features || []).map(f => `<li>${_esc(f)}</li>`).join('')}

    </ul>


  </div>`;

}








function switchPreviewTab(tab) {

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const btn = document.getElementById('tab-btn-'+tab);

  const cnt = document.getElementById('tab-content-'+tab);

  if(btn) btn.classList.add('active');

  if(cnt) cnt.classList.add('active');

  if(tab==='proposal') generateProposal();

  if(tab==='guide')    generateDeploymentGuide();

}



function _updateMountCommands() {

  const vip  = _getVal('prov-vip-start') || '10.100.20.100';

  const path = _getVal('prov-view-path') || '/data/ai_models';

  const cls  = _getVal('prov-cluster-name') || 'vast-storage-01';

  const n3 = document.getElementById('nfs3-mount-code');

  const n4 = document.getElementById('nfs4-mount-code');

  const s3 = document.getElementById('s3-config-code');

  if(n3) n3.textContent='mount -t nfs -o vers=3,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 '+vip+':'+path+' /mnt/vast';

  if(n4) n4.textContent='mount -t nfs -o vers=4.1,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 '+vip+':'+path+' /mnt/vast-nfs4';

  if(s3) s3.textContent='aws configure set default.s3.endpoint_url http://'+vip+' && aws configure set default.s3.max_concurrent_requests 32 && aws configure set default.s3.multipart_threshold 64MB';

}



// ============================================================

// === SECTION 8: EXPORT ENGINE ===

// ============================================================



function exportJsonConfig() {

  AppState.config.modified = new Date().toISOString();

  downloadJSON(AppState.config, _buildFilename('VAST-Configuration', 'json'));

  showToast('Configuration exported as JSON.','success');

}



function exportSizingBomText() {

  const r  = AppState.config.results;

  const sz = AppState.config.sizing;

  const cls= _getVal('prov-cluster-name') || 'vast-storage-01';

  let txt  = '=====================================\n  VAST CLUSTER SIZING BLUEPRINT\n  Cluster: '+cls+'\n  Generated: '+new Date().toLocaleDateString()+'\n=====================================\n\n';

  txt += 'I. HARDWARE\n';

  txt += '  C-Nodes           : '+(r.cnodeCount||4)+' ('+(r.cboxCount||1)+' CBox chassis)\n';

  txt += '  D-Nodes           : '+(r.dnodeCount||2)+' ('+(r.dboxModel||'ceres-df3015')+')\n';

  txt += '  Backend Switches  : '+(r.switchCount||2)+' (Redundant pair)\n';

  txt += '  Total Rack Space  : '+(r.ru||10)+' RU\n';

  txt += '  Max Power Draw    : '+((r.powerW||0)).toLocaleString()+' W\n';

  txt += '  Thermal Output    : '+((r.heatBTU||0)).toLocaleString()+' BTU/hr\n\n';

  txt += 'II. CAPACITY\n';

  txt += '  Target Usable     : '+((r.effectiveTB||500)).toFixed(1)+' TB\n';

  txt += '  Data Reduction    : '+(sz.reductionRatio||3.0)+':1\n';

  txt += '  Physical On-Flash : '+((r.physicalTB||167)).toFixed(1)+' TB\n';

  txt += '  Raw SSD Required  : '+((r.rawTB||172)).toFixed(1)+' TB\n';

  txt += '  SCM Buffer        : '+((r.scmTB||12.8)).toFixed(2)+' TB\n\n';

  txt += 'III. PERFORMANCE\n';

  txt += '  Read Throughput   : '+(sz.readThroughputGBs||40)+' GB/s\n';

  txt += '  Write Throughput  : '+(sz.writeThroughputGBs||10)+' GB/s\n';

  txt += '  Client Network    : '+(sz.clientNet||'100')+' GbE\n';

  txt += '  Backend Fabric    : '+(sz.fabricType||'RoCEv2')+'\n\n';

  txt += '=====================================\n  END OF DOCUMENT\n=====================================\n';

  downloadText(txt,_buildFilename('Bill-of-Materials', 'txt'));

  showToast('Sizing blueprint downloaded.','success');

}



function exportLldText() {

  const cls  = _getVal('prov-cluster-name') || 'vast-storage-01';

  const rows = document.querySelectorAll('#port-map-tbody tr');

  let txt = 'VAST CABLING AND NETWORK LLD -- '+cls+'\n'+'='.repeat(60)+'\nGenerated: '+new Date().toLocaleDateString()+'\n\n';

  txt += 'PORT ASSIGNMENT TABLE\n'+'-'.repeat(60)+'\n';

  rows.forEach(row => {

    const cells = row.querySelectorAll('td');

    if (cells.length >= 7) {

      txt += (cells[0].textContent||'').padEnd(15)+' '+(cells[1].textContent||'').padEnd(20)+' '+(cells[2].textContent||'').padEnd(30)+' '+(cells[4].textContent||'').padEnd(6)+' '+(cells[6].textContent||'')+'\n';

    }

  });

  downloadText(txt,_buildFilename('Network-LLD-and-Cabling', 'txt'));

  showToast('Cabling LLD downloaded.','success');

}



function exportProposalMarkdown() {

  const cls = _getVal('prov-cluster-name') || 'vast-storage-01';

  const el  = document.getElementById('proposal-preview-container');

  let md = '# VAST Data Enterprise Storage Proposal -- '+cls+'\n\n*Generated: '+new Date().toLocaleDateString()+'*\n\n';

  if (el) md += el.innerText.replace(/\n{3,}/g,'\n\n');

  downloadText(md,_buildFilename('Solution-Proposal', 'md'));

  showToast('GRC Proposal exported as Markdown.','success');

}



function exportDeploymentGuideText() {

  const cls = _getVal('prov-cluster-name') || 'vast-storage-01';

  const el  = document.getElementById('guide-preview-container');

  let txt = 'VAST AI OS DEPLOYMENT GUIDE -- '+cls+'\n'+'='.repeat(60)+'\nGenerated: '+new Date().toLocaleDateString()+'\n\n';

  if (el) txt += el.innerText.replace(/\n{3,}/g,'\n\n');

  downloadText(txt,_buildFilename('Deployment-Runbook', 'txt'));

  showToast('Deployment guide downloaded.','success');

}




// ============================================================
// FILE NAMING HELPER
// ============================================================

/**
 * Build a descriptive, human-readable download filename.
 * Format: {OrgName}_{ProjectName}_{DocType}_{YYYY-MM-DD}.{ext}
 * Falls back gracefully when customer fields are empty.
 */
function _buildFilename(docType, ext) {
  var org  = (_getVal('cust-org-name')    || '').trim();
  var proj = (_getVal('cust-project-name')|| '').trim()
          || (_getVal('prov-cluster-name') || '').trim()
          || (AppState && AppState.config && AppState.config.name ? AppState.config.name.trim() : '');
  var now  = new Date();
  var yyyy = now.getFullYear();
  var mm   = String(now.getMonth()+1).padStart(2,'0');
  var dd   = String(now.getDate()).padStart(2,'0');
  var date = yyyy + '-' + mm + '-' + dd;

  function slug(s) {
    return s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  var parts = [];
  if (org)  parts.push(slug(org));
  if (proj) parts.push(slug(proj));
  parts.push(docType);
  parts.push(date);
  return parts.join('_') + '.' + ext;
}

function downloadText(content, filename) {

  const blob = new Blob([content], { type:'text/plain;charset=utf-8' });

  const url  = URL.createObjectURL(blob);

  const a    = Object.assign(document.createElement('a'), { href:url, download:filename, style:'display:none' });

  document.body.appendChild(a);

  a.click();

  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 500);

}



function downloadJSON(obj, filename) {

  downloadText(JSON.stringify(obj, null, 2), filename);

}



// ============================================================

// === SECTION 9: IMPORT ENGINE ===

// ============================================================



function importConfigFromFile(file) {

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {

    try {

      const imp = JSON.parse(e.target.result);

      if (!imp.sizing && !imp.provisioning && !imp.results) { showToast('Invalid config file: missing required fields.','error'); return; }

      AppState.config = Object.assign({}, AppState.config, imp);

      AppState.config.modified = new Date().toISOString();

      _populateFormsFromState();

      calculateSizing(); generateNetworkConfig(); generateVcliCommands();

      showToast('Config "'+( imp.name||'Unknown')+'" loaded successfully.','success');

    } catch (err) {

      showToast('Parse error: '+err.message,'error');

    }

  };

  reader.readAsText(file);

}



function _populateFormsFromState() {

  const sz = AppState.config.sizing       || {};

  const nw = AppState.config.network      || {};

  const pv = AppState.config.provisioning || {};

  _setVal('target-usable',          sz.targetUsableTB);

  _setVal('capacity-unit',          sz.capacityUnit);

  _setVal('reduction-ratio',        sz.reductionRatio);

  _setVal('read-throughput',        sz.readThroughputGBs);

  _setVal('write-throughput',       sz.writeThroughputGBs);

  _setVal('client-net',             sz.clientNet);

  _setVal('fabric-type',            sz.fabricType);

  _setVal('deployment-type',        sz.deploymentType);

  _setVal('workload-profile',       sz.workloadProfile);

  _setVal('replication-target-type',sz.replicationTargetType);

  _setCheck('ha-config',            sz.haConfig ?? true);

  _setVal('net-mgmt-subnet',        nw.mgmtSubnet);

  _setVal('net-backend-subnet',     nw.backendSubnet);

  _setVal('net-frontend-subnet',    nw.frontendSubnet);

  _setVal('net-vlan-id',            nw.vlanFrontend);

  _setVal('net-vlan-backend',       nw.vlanBackend);

  _setVal('prov-cluster-name',      pv.clusterName);

  _setVal('prov-dns',               pv.dns);

  _setVal('prov-ntp',               pv.ntp);

  _setVal('prov-syslog',            pv.syslog);

  _setVal('prov-vip-start',         pv.vipStart);

  _setVal('prov-vip-end',           pv.vipEnd);

  _setVal('prov-vip-mask',          pv.vipMask);

  _setVal('prov-vip-gateway',       pv.vipGateway);

  _setVal('prov-vip-policy',        pv.vipPolicy);

  _setVal('prov-nfs-squash',        pv.nfsSquash);

  _setVal('prov-auth-source',       pv.authSource);

  _setVal('prov-view-path',         pv.viewPath);

  _setVal('prov-quota-gb',          pv.quotaTB);

  _setVal('prov-qos-max-bw',        pv.qosMaxBW);

  _setVal('prov-qos-max-iops',      pv.qosMaxIOPS);

  _setCheck('proto-nfs3', pv.protoNfs3 ?? true);

  _setCheck('proto-nfs4', pv.protoNfs4 ?? true);

  _setCheck('proto-smb',  pv.protoSmb  ?? true);

  _setCheck('proto-s3',   pv.protoS3   ?? true);

  _setCheck('proto-nvme', pv.protoNvme ?? false);

  updateReductionSlider(); updateReadSlider(); updateWriteSlider();

}



function saveConfig() {

  AppState.config.modified = new Date().toISOString();

  DB.save('configs', AppState.config).catch(() => {});

}



function setupDropzone() {

  const input  = document.createElement('input');

  input.type   = 'file'; input.accept = '.json'; input.id = 'import-file-input'; input.style.display = 'none';

  document.body.appendChild(input);

  input.addEventListener('change', (e) => { if (e.target.files && e.target.files[0]) importConfigFromFile(e.target.files[0]); });

  const ws = document.querySelector('.workspace');

  if (!ws) return;

  ws.addEventListener('dragover',  (e) => { e.preventDefault(); ws.style.outline='2px dashed var(--accent-teal)'; });

  ws.addEventListener('dragleave', ()  => { ws.style.outline=''; });

  ws.addEventListener('drop',      (e) => {

    e.preventDefault(); ws.style.outline='';

    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];

    if (file && file.name.endsWith('.json')) importConfigFromFile(file);

    else if (file) showToast('Drop a valid VAST JSON config file.','error');

  });

}



// ============================================================

// === SECTION 10: UPDATE ENGINE v2 ===

// Sources:

//   1. catalog.json  -- curated VAST product data (GitHub raw)

//   2. GitHub API    -- latest vast-csi driver release tag

// After update: propagates to PRODUCT_CATALOG, all generators,

// all document previews, hardware selects, and version strings.

// ============================================================



const KB_CATALOG_URL = 'https://raw.githubusercontent.com/ebeauzec/VASTbuilder/main/catalog.json';

const KB_CSI_API_URL = 'https://api.github.com/repos/vast-data/vast-csi/releases/latest';



/* Apply a fetched/cached catalog object to the live PRODUCT_CATALOG */

function _applyCatalog(data) {

  if (!data || typeof data !== 'object') return false;

  if (data.cboxModels    && Array.isArray(data.cboxModels))    PRODUCT_CATALOG.cboxModels    = data.cboxModels;

  if (data.dboxModels    && Array.isArray(data.dboxModels))    PRODUCT_CATALOG.dboxModels    = data.dboxModels;

  if (data.switchModels  && Array.isArray(data.switchModels))  PRODUCT_CATALOG.switchModels  = data.switchModels;

  if (data.vastosVersions&& Array.isArray(data.vastosVersions))PRODUCT_CATALOG.vastosVersions= data.vastosVersions;

  if (data.workloadPresets && typeof data.workloadPresets === 'object')

    Object.assign(PRODUCT_CATALOG.workloadPresets, data.workloadPresets);

  if (data.csiDriverVersion) PRODUCT_CATALOG.csiDriverVersion = data.csiDriverVersion;

  if (data.thirdParty && typeof data.thirdParty === 'object')

    PRODUCT_CATALOG.thirdParty = Object.assign(PRODUCT_CATALOG.thirdParty || {}, data.thirdParty);

  return true;

}



/* Load cached catalog from IndexedDB on startup */

async function loadCatalogFromCache() {

  try {

    const rec = await DB.get('knowledgeBase', 'KB_LAST_CHECKED');

    if (rec && rec.catalog) _applyCatalog(rec.catalog);

  } catch (_) {}

}



/* After catalog is applied, propagate to all live UI and generators */

function _propagateCatalogToUI() {

  try {

    var latestVer = _kbVer();

    var csiVer    = _kbCsiVer();

    /* Update DOM elements marked data-kb-version */

    document.querySelectorAll('[data-kb-version]').forEach(function(el) { el.textContent = latestVer; });

    document.querySelectorAll('[data-kb-csi-version]').forEach(function(el) { el.textContent = csiVer; });

    /* Re-populate hw-preset select with any new hardware models */

    var hwSel = document.getElementById('hw-preset');

    if (hwSel) {

      var selVal = hwSel.value;

      hwSel.innerHTML = '<option value="auto">Auto-Recommend</option>';

      PRODUCT_CATALOG.cboxModels.forEach(function(m) {

        var o = document.createElement('option');

        o.value = m.id; o.textContent = m.name;

        hwSel.appendChild(o);

      });

      hwSel.value = selVal || 'auto';

    }

    /* Re-run all generators so documents reflect updated catalog */

    if (typeof calculateSizing       === 'function') try { calculateSizing();           } catch(e){}

    if (typeof generateNetworkConfig === 'function') try { generateNetworkConfig();     } catch(e){}

    if (typeof generateVcliCommands  === 'function') try { generateVcliCommands();      } catch(e){}

    if (typeof renderIntegrationConfigs==='function') try { renderIntegrationConfigs(); } catch(e){}

    /* Deliverable generators (panels 8-10) regenerate lazily when user visits panel */

    /* Refresh Catalog modal if open */

    var catModal = document.getElementById('modal-catalog');

    if (catModal && catModal.style.display !== 'none')

      if (typeof renderProductCatalog === 'function') renderProductCatalog();

  } catch(e) { console.warn('_propagateCatalogToUI error', e); }

}



/* Compute human-readable diff between two catalog snapshots */

function _buildKBChangelog(oldCat, newCat) {

  var changes = [];

  /* VastOS versions */

  if (oldCat && newCat && oldCat.vastosVersions && newCat.vastosVersions) {

    var oldLV = (oldCat.vastosVersions.find(function(v){return v.latest;})||{}).version || '?';

    var newLV = (newCat.vastosVersions.find(function(v){return v.latest;})||{}).version || '?';

    if (oldLV !== newLV)

      changes.push({ type:'Updated', item:'VAST AI OS (latest)', detail: oldLV + ' → ' + newLV });

    newCat.vastosVersions.forEach(function(nv) {

      if (!oldCat.vastosVersions.find(function(ov){return ov.version===nv.version;}))

        changes.push({ type:'Added', item:'VastOS ' + nv.version, detail: nv.releaseDate + ': ' + ((nv.features||[]).join(', ')) });

    });

  }

  /* CSI driver */

  var oldCsi = (oldCat||{}).csiDriverVersion, newCsi = (newCat||{}).csiDriverVersion;

  if (newCsi && oldCsi !== newCsi)

    changes.push({ type: oldCsi ? 'Updated' : 'Added', item: 'VAST CSI Driver', detail: (oldCsi ? oldCsi + ' → ' : '') + newCsi });

  /* Hardware models */

  ['cboxModels','dboxModels','switchModels'].forEach(function(key) {

    var lbl = key === 'cboxModels' ? 'C-Node' : key === 'dboxModels' ? 'D-Node' : 'Switch';

    if (!oldCat || !newCat || !newCat[key]) return;

    (newCat[key]||[]).forEach(function(nm) {

      if (!oldCat[key] || !oldCat[key].find(function(om){return om.id===nm.id;}))

        changes.push({ type:'Added', item: lbl + ': ' + nm.name, detail: nm.description || '' });

    });

  });

  /* Third-party */

  if (newCat && newCat.thirdParty) {

    Object.keys(newCat.thirdParty).forEach(function(k) {

      var nt = newCat.thirdParty[k], ot = ((oldCat && oldCat.thirdParty)||{})[k] || {};

      if (nt.version && nt.version !== ot.version)

        changes.push({ type: ot.version ? 'Updated' : 'Added', item: k,

          detail: (ot.version ? ot.version + ' → ' : '') + nt.version + (nt.notes ? ' -- ' + nt.notes : '') });

    });

  }

  return changes;

}



/* Show changes in a modal (gracefully skipped if modal absent) */

function _showKBChangeModal(changes, latestVer, fetchedAt, oldVersionsList, newVersionsList) {
  var cont = document.getElementById('kb-changes-content');
  if (!cont) return;
  var h = '';

  /* ── What's New in VAST AI OS ─────────────────────────────────── */
  var allVers = newVersionsList ||
    (typeof PRODUCT_CATALOG !== 'undefined' && PRODUCT_CATALOG.vastosVersions) || [];
  var oldVerNums = (oldVersionsList || []).map(function(v){ return v.version; });
  var newVers    = allVers.filter(function(v){ return oldVerNums.indexOf(v.version) === -1; });
  var latestEntry = allVers.filter(function(v){ return v.latest; });
  if (!latestEntry.length && allVers.length) latestEntry = [allVers[allVers.length - 1]];
  var toShow = newVers.length ? newVers : latestEntry;

  if (toShow.length) {
    var sectionLabel = newVers.length ? 'New in This Update' : 'Current Release';
    h += '<div class="kb-whats-new">';
    h += '<div class="kb-section-title">' + sectionLabel + ' &mdash; VAST AI OS</div>';
    toShow.forEach(function(ver) {
      h += '<div class="kb-ver-card">';
      h += '<div class="kb-ver-card-header">';
      h += '<span class="kb-ver-num">VastOS ' + ver.version + '</span>';
      if (ver.latest) h += '<span class="kb-ver-latest">LATEST</span>';
      if (ver.releaseDate) h += '<span class="kb-ver-date">' + ver.releaseDate + '</span>';
      if (ver.track) h += '<span class="kb-ver-track">' + ver.track + '</span>';
      if (ver.releaseNotesUrl) {
        h += '<a class="kb-source-link" href="' + ver.releaseNotesUrl + '" target="_blank" rel="noopener">';
        h += 'Release Notes &#8599;</a>';
      }
      h += '</div>';
      var feats = ver.features || ver.highlights || [];
      if (feats.length) {
        h += '<div class="kb-feature-list">';
        feats.forEach(function(f){ h += '<span class="kb-feature-pill">' + f + '</span>'; });
        h += '</div>';
      }
      if (ver.notes) h += '<p class="kb-ver-notes">' + ver.notes + '</p>';
      h += '</div>';
    });
    h += '</div><hr class="kb-divider">';
  }

  /* ── Catalog diff ─────────────────────────────────────────────── */
  h += '<div class="kb-diff-header">';
  h += '<span style="font-size:.72rem;color:var(--color-text-muted);">Fetched ' + fetchedAt + ' &#8226; VastOS ' + latestVer + '</span>';
  if (changes && changes.length)
    h += '<span class="kb-diff-count">' + changes.length + ' change' + (changes.length !== 1 ? 's' : '') + '</span>';
  h += '</div>';

  if (!changes || !changes.length) {
    h += '<div class="kb-no-changes"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    h += 'Hardware models and integrations are already up to date.</div>';
  } else {
    /* Enrich changes with URLs from catalog */
    var cat = (typeof PRODUCT_CATALOG !== 'undefined') ? PRODUCT_CATALOG : {};
    var tp  = cat.thirdParty || {};
    h += '<div class="kb-diff-list">';
    changes.forEach(function(c) {
      var typeClass = c.type === 'Added' ? 'added' : c.type === 'Updated' ? 'updated' : 'removed';
      var detail = c.detail || '';
      if (detail.length > 110) detail = detail.substring(0, 107) + '...';
      /* Look up source URL */
      var srcUrl = '';
      if (tp[c.item] && tp[c.item].url) srcUrl = tp[c.item].url;
      h += '<div class="kb-diff-item">';
      h += '<span class="kb-diff-badge kb-diff-' + typeClass + '">' + c.type + '</span>';
      h += '<div class="kb-diff-body">';
      if (srcUrl) {
        h += '<a class="kb-diff-name kb-diff-link" href="' + srcUrl + '" target="_blank" rel="noopener">' + c.item + ' &#8599;</a>';
      } else {
        h += '<span class="kb-diff-name">' + c.item + '</span>';
      }
      if (detail) h += '<span class="kb-diff-detail">' + detail + '</span>';
      h += '</div></div>';
    });
    h += '</div>';
  }

  cont.innerHTML = h;
  var kbModal = document.getElementById('modal-kb-changes');
  if (kbModal) { kbModal.style.display = 'flex'; }
}



async function checkForUpdates() {
  var badge = document.getElementById('kb-status');
  if (badge) { badge.textContent = 'Fetching catalog…'; badge.style.color = 'var(--color-text-muted)'; }

  /* Snapshot current catalog for diff */
  var oldCatalog = {
    vastosVersions:  JSON.parse(JSON.stringify(PRODUCT_CATALOG.vastosVersions  || [])),
    cboxModels:      JSON.parse(JSON.stringify(PRODUCT_CATALOG.cboxModels      || [])),
    dboxModels:      JSON.parse(JSON.stringify(PRODUCT_CATALOG.dboxModels      || [])),
    switchModels:    JSON.parse(JSON.stringify(PRODUCT_CATALOG.switchModels    || [])),
    csiDriverVersion:PRODUCT_CATALOG.csiDriverVersion || null,
    thirdParty:      JSON.parse(JSON.stringify(PRODUCT_CATALOG.thirdParty || {}))
  };

  var errors = [], newCatalog = null;

  /* Source 1: catalog.json from GitHub */
  try {
    if (badge) badge.textContent = 'Fetching catalog.json…';
    var res = await fetch(KB_CATALOG_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    newCatalog = await res.json();
    if (!newCatalog.vastosVersions) throw new Error('Invalid catalog schema');
    _applyCatalog(newCatalog);
  } catch (e) { errors.push('catalog.json: ' + e.message); newCatalog = null; }

  /* Source 2: GitHub API -- latest VAST CSI driver release */
  try {
    if (badge) badge.textContent = 'Fetching CSI version…';
    var csiRes = await fetch(KB_CSI_API_URL, { cache: 'no-cache', headers: { 'Accept': 'application/vnd.github.v3+json' } });
    if (csiRes.ok) {
      var csiData = await csiRes.json();
      var rawTag = csiData.tag_name || csiData.name || null;
      /* Strip Helm chart prefixes: "helm-vastblock-2.6.5-hf6" -> "v2.6.5-hf6" */
      var csiVer = rawTag ? rawTag.replace(/^helm-vastblock-/i, 'v').replace(/^vastcsi-/i, 'v') : null;
      if (csiVer) {
        PRODUCT_CATALOG.csiDriverVersion = csiVer;
        if (newCatalog) newCatalog.csiDriverVersion = csiVer;
      }
    }
  } catch (e) { errors.push('CSI API: ' + e.message); }

  /* Fallback: offline */
  if (!newCatalog) {
    try {
      var cached = await DB.get('knowledgeBase', 'KB_LAST_CHECKED');
      if (cached && cached.catalog) {
        _applyCatalog(cached.catalog);
        var d = new Date(cached.value).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        showToast('Offline -- using catalog cached ' + d + '.', 3000);
      } else { showToast('Offline -- using built-in catalog (' + _kbVer() + ').', 3000); }
    } catch(_) {}
    updateKBStatus();
    return;
  }

  /* Persist to IndexedDB */
  var latestVer = _kbVer();
  var fetchedAt = new Date().toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
  try {
    await DB.save('knowledgeBase', {
      key: 'KB_LAST_CHECKED', value: new Date().toISOString(),
      catalogVersion: latestVer, source: 'github',
      catalog: newCatalog, csiVersion: PRODUCT_CATALOG.csiDriverVersion || null
    });
  } catch (_) {}

  /* Propagate to all live UI and generators */
  _propagateCatalogToUI();
  updateKBStatus();

  /* Show diff */
  var changes = _buildKBChangelog(oldCatalog, newCatalog);
  var summary = changes.length ? changes.length + ' change' + (changes.length > 1 ? 's' : '') : 'no changes';
  showToast('KB updated -- VastOS ' + latestVer + ' | CSI ' + _kbCsiVer() + ' | ' + summary + '.', 4000);
  _showKBChangeModal(changes, latestVer, fetchedAt, oldCatalog.vastosVersions || []);
  if (errors.length) console.warn('KB update warnings:', errors);
}



function updateKBStatus() {

  DB.get('knowledgeBase', 'KB_LAST_CHECKED').then(function(rec) {

    var el = document.getElementById('kb-status');

    if (!el) return;

    var csiTag = PRODUCT_CATALOG.csiDriverVersion ? ' | CSI ' + PRODUCT_CATALOG.csiDriverVersion : '';

    if (!rec) {

      el.textContent = 'Built-in -- VastOS ' + _kbVer() + csiTag + ' (click Update KB to sync)';

      el.style.color = 'var(--color-text-muted)'; return;

    }

    var checkedDate = new Date(rec.value);

    var d = checkedDate.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});

    var ageDays = Math.floor((Date.now() - checkedDate.getTime()) / 86400000);

    var ver = rec.catalogVersion || _kbVer();

    var csiDisp = rec.csiVersion ? ' | CSI ' + rec.csiVersion : csiTag;

    el.title = 'Source: ' + (rec.source||'built-in') + ' | Checked: ' + checkedDate.toISOString();

    if (ageDays <= 7) {

      el.textContent = 'Catalog current as of ' + d + ' -- VastOS ' + ver + csiDisp;

      el.style.color = 'var(--accent-teal)';

    } else if (ageDays <= 30) {

      el.textContent = 'Catalog from ' + d + ' (' + ageDays + 'd old) -- VastOS ' + ver + csiDisp;

      el.style.color = 'var(--accent-amber)';

    } else {

      el.textContent = 'Catalog stale (' + ageDays + 'd) -- VastOS ' + ver + ' -- click Update KB';

      el.style.color = '#f87171';

    }

  }).catch(function(){});

}



// ============================================================

// === SECTION 11: CHECKPOINT MANAGER ===

// ============================================================



let undoStack = [], redoStack = [];



function saveStateSnapshot() {

  undoStack.push(JSON.parse(JSON.stringify(AppState.config)));

  if (undoStack.length > 50) undoStack.shift();

  redoStack = [];

  _updateUndoRedoButtons();

}



function undo() {

  if (!undoStack.length) { showToast('Nothing to undo.','info'); return; }

  redoStack.push(JSON.parse(JSON.stringify(AppState.config)));

  AppState.config = undoStack.pop();

  _populateFormsFromState(); calculateSizing(); generateVcliCommands();

  _updateUndoRedoButtons(); showToast('Undo applied.','info');

}



function redo() {

  if (!redoStack.length) { showToast('Nothing to redo.','info'); return; }

  undoStack.push(JSON.parse(JSON.stringify(AppState.config)));

  AppState.config = redoStack.pop();

  _populateFormsFromState(); calculateSizing(); generateVcliCommands();

  _updateUndoRedoButtons(); showToast('Redo applied.','info');

}



function _updateUndoRedoButtons() {

  const u = document.getElementById('undo-btn');

  const r = document.getElementById('redo-btn');

  if(u) u.disabled = undoStack.length === 0;

  if(r) r.disabled = redoStack.length === 0;

}



async function createCheckpoint() {

  const inp  = document.getElementById('new-checkpoint-name');

  const name = (inp && inp.value.trim()) || ('Checkpoint '+new Date().toLocaleTimeString());

  const cp   = { name, timestamp:new Date().toISOString(), config:JSON.parse(JSON.stringify(AppState.config)) };

  await DB.save('checkpoints', cp);

  if(inp) inp.value='';

  renderCheckpointsList();

  showToast('Checkpoint "'+name+'" saved.','success');

}



async function restoreCheckpoint(id) {

  const cp = await DB.get('checkpoints', id);

  if(!cp) { showToast('Checkpoint not found.','error'); return; }

  saveStateSnapshot();

  AppState.config = Object.assign({}, AppState.config, cp.config);

  _populateFormsFromState(); calculateSizing(); generateVcliCommands();

  showToast('Restored: "'+cp.name+'"','success');

}



async function deleteCheckpoint(id) {

  await DB.delete('checkpoints', id);

  renderCheckpointsList();

  showToast('Checkpoint deleted.','info');

}



async function renderCheckpointsList() {

  const container = document.getElementById('checkpoints-list-container');

  if(!container) return;

  const all = await DB.getAll('checkpoints');

  const badge = document.getElementById('checkpoint-count-badge');

  if(badge) badge.textContent = all.length;

  if(!all.length) { container.innerHTML='<div class="no-checkpoints">No checkpoints saved yet.</div>'; return; }

  const sorted = all.sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp));

  container.innerHTML = sorted.map(cp => {

    const d  = new Date(cp.timestamp);

    const lbl= d.toLocaleDateString('en-US',{month:'short',day:'numeric'});

    const tm = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});

    const cn = (cp.config&&cp.config.results&&cp.config.results.cnodeCount)||'?';

    const dn = (cp.config&&cp.config.results&&cp.config.results.dnodeCount)||'?';

    const ef = (cp.config&&cp.config.results&&cp.config.results.effectiveTB)?cp.config.results.effectiveTB.toFixed(0):'?';

    return '<div style="border:1px solid var(--panel-border);border-radius:8px;padding:0.75rem;margin-bottom:0.5rem;background:rgba(255,255,255,0.03);">'+

      '<div style="font-weight:600;font-size:0.9rem;color:#E2E8F0;margin-bottom:0.25rem;">'+_esc(cp.name)+'</div>'+

      '<div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:0.5rem;">'+lbl+' at '+tm+' | '+cn+' C-Nodes, '+dn+' D-Nodes, '+ef+' TB</div>'+

      '<div style="display:flex;gap:0.5rem;">'+

        '<button class="btn btn-primary btn-sm" onclick="restoreCheckpoint('+cp.id+')" style="flex:1;justify-content:center;font-size:0.75rem;">Restore</button>'+

        '<button class="btn btn-secondary btn-sm" onclick="deleteCheckpoint('+cp.id+')" style="font-size:0.75rem;padding:0.25rem 0.5rem;">X</button>'+

      '</div></div>';

  }).join('');

}



function toggleCheckpointsPanel() {

  const panel = document.getElementById('checkpoints-panel');

  if(panel) panel.classList.toggle('open');

}



// ============================================================

// === SECTION 12: UI ENGINE ===

// ============================================================



let _toastTimer = null;



function showToast(msg, type) {

  type = type || 'success';

  const toast  = document.getElementById('toast');

  const textEl = document.getElementById('toast-text');

  if (!toast || !textEl) return;

  textEl.textContent = msg;

  const cols = { success:'#10B981', error:'#EF4444', info:'#38BDF8', warning:'#F59E0B' };

  toast.style.borderLeft = '4px solid '+(cols[type]||cols.success);

  toast.classList.add('show');

  clearTimeout(_toastTimer);

  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);

}



function copyText(elementId) {

  const el = document.getElementById(elementId);

  if (!el) return;

  const text = el.textContent || el.innerText || '';

  if (navigator.clipboard && navigator.clipboard.writeText) {

    navigator.clipboard.writeText(text).then(() => showToast('Copied!','success')).catch(() => _fallbackCopy(text));

  } else { _fallbackCopy(text); }

}



function _fallbackCopy(text) {

  const ta = Object.assign(document.createElement('textarea'),{value:text,style:'position:fixed;opacity:0'});

  document.body.appendChild(ta); ta.focus(); ta.select();

  try { document.execCommand('copy'); showToast('Copied!','success'); } catch(_){ showToast('Copy failed.','error'); }

  document.body.removeChild(ta);

}



function copyVcliToClipboard() {

  const el = document.getElementById('vcli-output-container');

  if (!el) return;

  const text = el.innerText || el.textContent || '';

  if (navigator.clipboard && navigator.clipboard.writeText) {

    navigator.clipboard.writeText(text).then(() => showToast('VCLI script copied!','success')).catch(() => _fallbackCopy(text));

  } else { _fallbackCopy(text); }

}



function attachAllListeners() {

  // Sizing inputs

  ['target-usable','capacity-unit','reduction-ratio','read-throughput','write-throughput',

   'client-net','fabric-type','deployment-type','workload-profile','ha-config',

   'replication-target-type','remote-cloud-vendor','remote-target-usable','remote-capacity-unit',

   'remote-workload-profile','remote-reduction-ratio','remote-mirror-mode','remote-mirror-journal-ratio',

   'wan-change-rate','wan-sync-window','wan-peak-factor',

   'cold-tier-enabled','cold-tier-usable','cold-tier-reduction','cold-tier-provider','cold-tier-class'

  ].forEach(id => {

    const el = document.getElementById(id);

    if (!el) return;

    const ev = (el.type==='checkbox'||el.tagName==='SELECT') ? 'change' : 'input';

    el.addEventListener(ev, () => { saveStateSnapshot(); calculateSizing(); });

  });



  // Network inputs

  ['net-mgmt-subnet','net-backend-subnet','net-frontend-subnet','net-vlan-id','net-vlan-backend'].forEach(id => {

    const el = document.getElementById(id);

    if (el) el.addEventListener('input', generateNetworkConfig);

  });



  // Provisioning inputs

  ['prov-cluster-name','prov-dns','prov-ntp','prov-syslog',

   'prov-vip-start','prov-vip-end','prov-vip-mask','prov-vip-gateway','prov-vip-policy',

   'prov-nfs-squash','prov-auth-source','prov-view-path','prov-quota-gb',

   'prov-qos-max-bw','prov-qos-max-iops',

   'proto-nfs3','proto-nfs4','proto-smb','proto-s3','proto-nvme',

   'vcli-format-style','vcli-show-explanations'

  ].forEach(id => {

    const el = document.getElementById(id);

    if (!el) return;

    const ev = (el.type==='checkbox'||el.tagName==='SELECT') ? 'change' : 'input';

    el.addEventListener(ev, generateVcliCommands);

  });



  // Workload preset override

  const wpEl = document.getElementById('workload-profile');

  if (wpEl) wpEl.addEventListener('change', () => { saveStateSnapshot(); adjustWorkloadDefaults(); });



  // Remote auto-size toggle

  const rasEl = document.getElementById('remote-auto-size');

  if (rasEl) rasEl.addEventListener('change', toggleRemoteAutoSize);

}



// ─── DOM Helpers ────────────────────────────────────────────



function _showHide(id, visible) {

  const el = document.getElementById(id);

  if (el) el.style.display = visible ? '' : 'none';

}



function _setText(id, value) {

  if (value === undefined || value === null) return;

  const el = document.getElementById(id);

  if (el) el.textContent = value;

}



function _setVal(id, value) {

  if (value === undefined || value === null) return;

  const el = document.getElementById(id);

  if (el) el.value = value;

}



function _setCheck(id, checked) {

  const el = document.getElementById(id);

  if (el) el.checked = !!checked;

}



function _getVal(id) {

  const el = document.getElementById(id);

  return el ? el.value : '';

}



function _getSelect(id) { return _getVal(id); }



function _getCheck(id) {

  const el = document.getElementById(id);

  return el ? el.checked : false;

}



function _esc(str) {

  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

}



// ============================================================

// === SECTION 12b: UI ENGINE — Modal, Tab & Stage Management ===

// ============================================================



// ----- Modal Management -----

function showModal(id) {

  const overlay = document.getElementById('modal-overlay');

  if (overlay) overlay.classList.add('active');

  // HTML modals use display:flex (inline script sets display:none then target to flex)

  document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; });

  const modal = document.getElementById(id);

  if (modal) modal.style.display = 'flex';

  if (id === 'modal-catalog') renderProductCatalog();

}



function hideModal(id) {

  const modal = document.getElementById(id);

  if (modal) modal.style.display = 'none';

  const anyOpen = [...document.querySelectorAll('.modal')].some(m => m.style.display !== 'none');

  if (!anyOpen) {

    const overlay = document.getElementById('modal-overlay');

    if (overlay) overlay.classList.remove('active');

  }

}



function closeModalOnOverlay(event) {

  if (event.target === document.getElementById('modal-overlay')) {

    document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; });

    const overlay = document.getElementById('modal-overlay');

    if (overlay) overlay.classList.remove('active');

  }

}



// ----- Generic Tab Switcher -----

function _switchTab(prefix, tab, containerPrefix) {

  // Deactivate all tab buttons with this prefix

  document.querySelectorAll('.' + prefix + '-tab-btn, [id^="' + prefix + '-tab-"]').forEach(btn => {

    btn.classList.remove('active');

  });

  // Deactivate all tab content panels

  document.querySelectorAll('[id^="' + (containerPrefix || prefix) + '-content-"]').forEach(panel => {

    panel.classList.remove('active');

    panel.style.display = 'none';

  });

  // Activate selected tab button and panel

  const btn = document.getElementById(prefix + '-tab-' + tab);

  const panel = document.getElementById((containerPrefix || prefix) + '-content-' + tab);

  if (btn) btn.classList.add('active');

  if (panel) { panel.classList.add('active'); panel.style.display = ''; }

}



function switchAdvTab(tab) {

  // Panel 7 — Advanced Features tabs: bcdr / security / integrations

  document.querySelectorAll('.adv-tab-btn').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('[id^="adv-content-"]').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });

  const btn = document.getElementById('adv-tab-' + tab);

  const panel = document.getElementById('adv-content-' + tab);

  if (btn) btn.classList.add('active');

  if (panel) { panel.classList.add('active'); panel.style.display = ''; }

  if (tab === 'integrations') renderIntegrationConfigs();

}



function switchDelTab(tab) {

  // Panel 9 — Technical Deliverables: use classList to match CSS rules

  document.querySelectorAll('.del-tab-btn').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.del-content').forEach(p => p.classList.remove('active'));

  const btn = document.getElementById('del-tab-' + tab);

  const panel = document.getElementById('del-content-' + tab);

  if (btn) btn.classList.add('active');

  if (panel) panel.classList.add('active');

}



function switchDepTab(tab) {

  // Panel 10 — Deployment Package: use classList to match CSS rules

  document.querySelectorAll('.dep-tab-btn').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.dep-content').forEach(p => p.classList.remove('active'));

  const btn = document.getElementById('dep-tab-' + tab);

  const panel = document.getElementById('dep-content-' + tab);

  if (btn) btn.classList.add('active');

  if (panel) panel.classList.add('active');

}



function switchPropTab(tab) {

  // Panel 8 — Design Proposal: use classList to match CSS rules

  document.querySelectorAll('.prop-tab-btn').forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.prop-content').forEach(p => p.classList.remove('active'));

  const btn = document.getElementById('prop-tab-' + tab);

  const panel = document.getElementById('prop-content-' + tab);

  if (btn) btn.classList.add('active');

  if (panel) panel.classList.add('active');

  if (tab === 'roi') { if (typeof calculateRoi === 'function') calculateRoi(); else calculateROI(); }

  if (tab === 'executive' || tab === 'solution') generateProposal();

}



// Legacy: switchPreviewTab maps to switchDelTab for backward compatibility

function switchPreviewTab(tab) { switchDelTab(tab); }



// ----- Stage Collapse / Expand -----

function toggleStage(stageId) {

  const group = document.getElementById(stageId);

  if (!group) return;

  const steps = group.querySelector('.stage-steps');

  const header = group.querySelector('.stage-header');

  if (!steps) return;

  const isOpen = steps.style.display !== 'none';

  steps.style.display = isOpen ? 'none' : '';

  if (header) header.classList.toggle('collapsed', isOpen);

}



// ----- Preset Application -----

function applyPreset(presetName) {

  const preset = PRODUCT_CATALOG.workloadPresets[presetName];

  if (!preset) { console.warn('Unknown preset:', presetName); return; }



  // Highlight the selected card

  document.querySelectorAll('.preset-card').forEach(card => {

    card.classList.toggle('active', card.dataset.preset === presetName);

  });



  // Update workload profile selects

  _setVal('wl-primary-profile', presetName);

  _setVal('workload-profile', presetName);

  _setVal('deployment-type', 'on-prem');



  // Apply performance defaults

  const rtEl = document.getElementById('read-throughput');

  const wtEl = document.getElementById('write-throughput');

  const rrEl = document.getElementById('reduction-ratio');

  if (rtEl) { rtEl.value = preset.readThroughputGBs; updateReadSlider(); }

  if (wtEl) { wtEl.value = preset.writeThroughputGBs; updateWriteSlider(); }

  if (rrEl) { rrEl.value = preset.reductionRatio;    updateReductionSlider(); }



  // Apply network defaults

  _setVal('client-net', preset.clientNet || '100');

  _setVal('fabric-type', preset.fabricType || 'RoCEv2');



  // Apply protocol defaults from preset

  if (presetName === 'vmware-vsphere') {

    _setCheck('proto-nfs4', true); _setCheck('proto-nfs3', false); _setCheck('proto-smb', false);

  } else if (presetName === 'backup-archive') {

    _setCheck('proto-s3', true); _setCheck('proto-nfs3', true); _setCheck('proto-nfs4', false);

  } else if (presetName === 'media-vfx') {

    _setCheck('proto-nfs3', true); _setCheck('proto-smb', true);

  }



  saveStateSnapshot();

  calculateSizing();

  generateVcliCommands();

  showToast('Preset applied: ' + preset.name, 'success');

}



// ----- New Config -----

function newConfig() {

  if (!confirm('Start a new configuration? Unsaved changes will be lost.')) return;

  // Reset key state

  AppState.config.name = 'New VAST Design';

  AppState.config.modified = new Date().toISOString();

  const titleEl = document.getElementById('config-title');

  if (titleEl) titleEl.value = 'New VAST Design';

  // Clear all form fields to defaults

  const defaults = {

    'target-usable': 500, 'capacity-unit': 'TB', 'reduction-ratio': 3.0,

    'read-throughput': 40, 'write-throughput': 10, 'client-net': '100',

    'fabric-type': 'RoCEv2', 'deployment-type': 'on-prem',

    'prov-cluster-name': 'vast-cluster-01', 'prov-dns': '10.100.20.10',

    'prov-ntp': '10.100.20.11', 'prov-syslog': '10.100.20.12',

    'prov-vip-start': '10.100.20.100', 'prov-vip-end': '10.100.20.119',

    'prov-vip-mask': 24, 'prov-vip-gateway': '10.100.20.1',

    'cust-org-name': '', 'cust-industry': '', 'cust-project-name': ''

  };

  Object.entries(defaults).forEach(([id, val]) => _setVal(id, val));

  _setCheck('ha-config', true);

  _setCheck('proto-nfs3', true); _setCheck('proto-nfs4', true);

  _setCheck('proto-smb', true); _setCheck('proto-s3', true); _setCheck('proto-nvme', false);

  updateReductionSlider(); updateReadSlider(); updateWriteSlider();

  calculateSizing();

  generateNetworkConfig();

  generateVcliCommands();

  switchStep(1);

  showToast('New configuration started.', 'success');

}



// ----- Product Catalog Modal -----

function renderProductCatalog() {

  const container = document.getElementById('catalog-content');

  if (!container) return;

  const latest = PRODUCT_CATALOG.vastosVersions.find(v => v.latest);

  let html = `<div style="margin-bottom:1.5rem;">

    <div class="info-callout teal" style="margin-bottom:1rem;">

      <span class="info-callout-icon">ℹ️</span>

      <span class="info-callout-text">Latest: <strong>VastOS / VAST AI OS ${latest ? latest.version : '5.4.1-SP4'}</strong> (${latest ? latest.releaseDate : '2026-Q2'}). All hardware specs from official vastdata.com product pages.</span>

    </div>

    <h4 style="color:var(--accent-teal);margin-bottom:.75rem;">Compute Nodes (CBox / CNode)</h4>

    <table class="cabling-table" style="margin-bottom:1.5rem;">

      <thead><tr><th>Model</th><th>CPU</th><th>RAM</th><th>Network</th><th>RU</th><th>Power</th></tr></thead>

      <tbody>`;

  PRODUCT_CATALOG.cboxModels.forEach(m => {

    html += `<tr><td><strong>${_esc(m.name)}</strong><br><span style="font-size:.72rem;color:var(--color-text-muted)">${_esc(m.description)}</span></td>

      <td style="font-size:.8rem">${_esc(m.cpu)}</td><td style="font-size:.8rem">${_esc(m.ramPerNode)}</td>

      <td style="font-size:.8rem">${_esc(m.networkPerNode)}</td><td>${m.ruSize}U</td><td>${m.powerPerNode}W</td></tr>`;

  });

  html += `</tbody></table>

    <h4 style="color:var(--accent-amber);margin-bottom:.75rem;">Storage Nodes (DBox / Ceres)</h4>

    <table class="cabling-table" style="margin-bottom:1.5rem;">

      <thead><tr><th>Model</th><th>QLC Capacity</th><th>SCM Buffer</th><th>DPU</th><th>RU</th><th>Power</th></tr></thead>

      <tbody>`;

  PRODUCT_CATALOG.dboxModels.forEach(m => {

    html += `<tr><td><strong>${_esc(m.name)}</strong><br><span style="font-size:.72rem;color:var(--color-text-muted)">${_esc(m.description)}</span></td>

      <td style="font-family:var(--font-mono)">${m.qlcCapacityTB ? m.qlcCapacityTB + ' TB' : '—'}</td>

      <td style="font-family:var(--font-mono)">${m.scmCapacityTB ? m.scmCapacityTB + ' TB' : '—'}</td>

      <td style="font-size:.8rem">${m.dpu || m.partnerModel || '—'}</td><td>${m.ruSize}U</td><td>${m.powerWatts ? m.powerWatts + 'W' : '—'}</td></tr>`;

  });

  html += `</tbody></table>

    <h4 style="color:var(--accent-violet);margin-bottom:.75rem;">Backend Fabric Switches</h4>

    <table class="cabling-table" style="margin-bottom:1.5rem;">

      <thead><tr><th>Model</th><th>Ports</th><th>Fabric Type</th><th>RU</th><th>Buffer</th></tr></thead>

      <tbody>`;

  PRODUCT_CATALOG.switchModels.forEach(m => {

    html += `<tr><td><strong>${_esc(m.name)}</strong></td><td style="font-size:.82rem">${_esc(m.ports)}</td>

      <td><span class="badge ${m.fabricType==='InfiniBand'?'violet':'teal'}">${_esc(m.fabricType)}</span></td>

      <td>${m.ruSize}U</td><td>${m.bufferMB}MB</td></tr>`;

  });

  html += `</tbody></table>

    <h4 style="color:var(--accent-sky);margin-bottom:.75rem;">VAST AI OS Versions</h4>

    <table class="cabling-table">

      <thead><tr><th>Version</th><th>Released</th><th>Key Features</th></tr></thead>

      <tbody>`;

  PRODUCT_CATALOG.vastosVersions.slice().reverse().forEach(v => {

    html += `<tr><td><strong>${_esc(v.version)}</strong>${v.latest ? ' <span class="badge teal">Latest</span>' : ''}</td>

      <td>${_esc(v.releaseDate)}</td><td style="font-size:.8rem">${(v.features||[]).join(', ')}</td></tr>`;

  });

  html += '</tbody></table></div>';

  container.innerHTML = html;

}



// ----- Integration Config Generators -----

function renderIntegrationConfigs() {

  const r = AppState.config.results;

  const p = AppState.config.provisioning;

  const vip = (p && p.vipStart) ? p.vipStart : '10.100.20.100';

  const path = (p && p.viewPath) ? p.viewPath : '/data';

  const clusterName = (p && p.clusterName) ? p.clusterName : 'vast-cluster-01';



  // VMware NFS datastore config block

  const vmEl = document.getElementById('vmware-config-block');

  if (vmEl) {

    vmEl.innerHTML = `<span class="comment"># vCenter: Add NFS 4.1 Datastore via vSphere Client or PowerCLI</span>\n` +

      `<span class="comment"># ESXi host NFS mount (run per-host or via vCenter Bulk Config):</span>\n` +

      `<span class="kw">esxcli</span> storage nfs41 add <span class="key">-H</span> <span class="str">${vip}</span> <span class="key">-s</span> <span class="str">${path}</span> <span class="key">-v</span> <span class="str">VAST-${clusterName}</span>\n` +

      `<span class="comment"># Enable VAAI-NAS on ESXi hosts:</span>\n` +

      `<span class="kw">esxcli</span> system settings advanced set <span class="key">-o</span> /DataMover/HardwareAcceleratedMove <span class="key">-i</span> <span class="num">1</span>\n` +

      `<span class="kw">esxcli</span> system settings advanced set <span class="key">-o</span> /DataMover/HardwareAcceleratedInit <span class="key">-i</span> <span class="num">1</span>\n` +

      `<span class="comment"># Recommended: 4 VIPs per CNode (${r && r.cnodeCount ? r.cnodeCount * 4 : 16} VIPs total for this cluster)</span>`;

  }



  // Kubernetes StorageClass + PVC YAML

  const k8sEl = document.getElementById('k8s-config-block');

  const scName = _getVal('int-k8s-storageclass') || 'vast-storageclass';

  const ns = _getVal('int-k8s-namespace') || 'vast-storage';

  const accessMode = _getVal('int-k8s-access-mode') || 'ReadWriteMany';

  if (k8sEl) {

    k8sEl.innerHTML =

      `<span class="comment"># 1. VAST CSI Driver installation (via Helm or OperatorHub)</span>\n` +

      `<span class="kw">helm</span> repo add vast-csi https://vast-data.github.io/vast-csi\n` +

      `<span class="kw">helm</span> install vast-csi vast-csi/vast-csi <span class="key">--namespace</span> kube-system\n\n` +

      `<span class="comment"># 2. StorageClass definition</span>\n` +

      `<span class="key">apiVersion:</span> <span class="str">storage.k8s.io/v1</span>\n` +

      `<span class="key">kind:</span> <span class="str">StorageClass</span>\n` +

      `<span class="key">metadata:</span>\n  <span class="key">name:</span> <span class="str">${_esc(scName)}</span>\n` +

      `<span class="key">provisioner:</span> <span class="str">csi.vastdata.com</span>\n` +

      `<span class="key">parameters:</span>\n  <span class="key">nfsServer:</span> <span class="str">${vip}</span>\n  <span class="key">nfsExport:</span> <span class="str">${_esc(path)}</span>\n` +

      `<span class="key">mountOptions:</span>\n  - <span class="str">nconnect=8</span>\n  - <span class="str">rsize=1048576</span>\n  - <span class="str">wsize=1048576</span>\n\n` +

      `<span class="comment"># 3. PersistentVolumeClaim example</span>\n` +

      `<span class="key">apiVersion:</span> <span class="str">v1</span>\n<span class="key">kind:</span> <span class="str">PersistentVolumeClaim</span>\n` +

      `<span class="key">metadata:</span>\n  <span class="key">name:</span> <span class="str">vast-pvc</span>\n  <span class="key">namespace:</span> <span class="str">${_esc(ns)}</span>\n` +

      `<span class="key">spec:</span>\n  <span class="key">accessModes:</span> [<span class="str">${_esc(accessMode)}</span>]\n` +

      `  <span class="key">storageClassName:</span> <span class="str">${_esc(scName)}</span>\n` +

      `  <span class="key">resources:</span>\n    <span class="key">requests:</span>\n      <span class="key">storage:</span> <span class="str">100Gi</span>`;

  }



  // OpenStack Cinder config

  const osEl = document.getElementById('openstack-config-block');

  if (osEl) {

    osEl.innerHTML =

      `<span class="comment"># /etc/cinder/cinder.conf — VAST NVMe/TCP backend (VastOS 5.3+)</span>\n` +

      `<span class="key">[DEFAULT]</span>\n<span class="key">enabled_backends</span> = <span class="str">vast-nvme</span>\n\n` +

      `<span class="key">[vast-nvme]</span>\n` +

      `<span class="key">volume_driver</span> = <span class="str">cinder.volume.drivers.vast.VASTDriver</span>\n` +

      `<span class="key">vast_mgmt_host</span> = <span class="str">${vip}</span>\n` +

      `<span class="key">vast_mgmt_port</span> = <span class="num">443</span>\n` +

      `<span class="key">vast_vip_pool</span> = <span class="str">vippool-${_esc(clusterName)}</span>\n` +

      `<span class="key">vast_root_export</span> = <span class="str">${_esc(path)}</span>\n` +

      `<span class="key">volume_backend_name</span> = <span class="str">vast-nvme</span>\n\n` +

      `<span class="comment"># For Manila (file share service):</span>\n` +

      `<span class="key">share_driver</span> = <span class="str">manila.share.drivers.vast.VASTShareDriver</span>\n` +

      `<span class="key">vast_share_nfs_server</span> = <span class="str">${vip}</span>`;

  }

}



// ----- ROI Calculator -----

function calculateROI() {

  const currentCostPerTB = parseFloat(_getVal('roi-current-cost-per-tb') || _getVal('roi-current-storage-cost')) || 50;

  const currentCapTB     = parseFloat(_getVal('roi-current-capacity-tb') || _getVal('roi-current-capacity'))   || 500;

  const staffHours       = parseFloat(_getVal('roi-staff-hours-month')   || _getVal('roi-staff-hours'))         || 20;

  const staffRate        = parseFloat(_getVal('roi-staff-rate-hour')     || _getVal('roi-staff-rate'))           || 150;



  const r = AppState.config.results || {};

  const targetUsable = r.effectiveTB || AppState.config.sizing?.targetUsableTB || 500;

  const reductionRatio = AppState.config.sizing?.reductionRatio || 3.0;



  // 3-year cost model

  const currentStorage3yr = currentCostPerTB * currentCapTB * 3;

  const currentStaff3yr   = staffHours * staffRate * 12 * 3;

  const currentTotal3yr   = currentStorage3yr + currentStaff3yr;



  // VAST: raw TB after data reduction; rough all-flash $/TB/yr premium offset by reduction gains

  const vastRawTB         = targetUsable / reductionRatio;

  const vastStorage3yr    = vastRawTB * 130 * 3;   // ~$130/TB/yr all-flash TCO estimate

  const vastStaff3yr      = currentStaff3yr * 0.4; // 60% staff savings (unified mgmt, no tiering)

  const vastTotal3yr      = vastStorage3yr + vastStaff3yr;



  const totalSavings      = currentTotal3yr - vastTotal3yr;

  const capacityGain      = ((reductionRatio - 1) / 1 * 100).toFixed(0);

  const paybackMonths     = vastStorage3yr > 0 ? Math.round((vastStorage3yr / 12) / Math.max((currentTotal3yr - vastTotal3yr) / 36, 1)) : 24;



  // Update UI

  _setText('roi-current-total',  '$' + Math.round(currentTotal3yr / 1000) + 'K');

  _setText('roi-vast-total',     '$' + Math.round(vastTotal3yr / 1000) + 'K');

  _setText('roi-savings',        (totalSavings > 0 ? '+' : '') + '$' + Math.round(totalSavings / 1000) + 'K');

  _setText('roi-payback',        paybackMonths + ' months');

  _setText('roi-capacity-gain',  capacityGain + '%');

  _setText('roi-staff-savings',  '60%');

  const roiSavingsEl = document.getElementById('roi-savings');

  if (roiSavingsEl) roiSavingsEl.style.color = totalSavings > 0 ? 'var(--accent-teal)' : 'var(--accent-rose)';

}



// ----- Export All Documents -----

function exportAllDocuments() {

  // Generate all docs first, then trigger print

  generateAllDocuments();

  setTimeout(() => window.print(), 400);

}



// ----- Export wrappers for specific deliverables -----

function exportHldText() {

  const el = document.getElementById('del-content-hld');

  const text = el ? (el.innerText || el.textContent) : 'HLD not generated.';

  downloadText(text, _buildFilename('High-Level-Design', 'txt'));

}

function exportAtpText() {

  const el = document.getElementById('dep-content-atp');

  const text = el ? (el.innerText || el.textContent) : 'ATP not generated.';

  downloadText(text, _buildFilename('Acceptance-Test-Plan', 'txt'));

}

function exportBcdrRunbook() {

  const el = document.getElementById('dep-content-bcdr');

  const text = el ? (el.innerText || el.textContent) : 'BC/DR Runbook not generated.';

  downloadText(text, _buildFilename('BCDR-Runbook', 'txt'));

}



// ----- generateAllDocuments orchestrator -----

function generateAllDocuments() {

  // Always regenerate all documents from current AppState

  generateExportPanel(); // handles BOM, firewall, HLD, LLD, ATP, BC/DR, runbook, mounts

}





// ----- LLD Generator -----

function _buildLLD() {

  const cfg = AppState.config;

  const r   = cfg.results || {};

  const p   = cfg.provisioning || {};

  const s   = cfg.sizing || {};

  const n   = cfg.network || {};

  const org = (cfg.customer && cfg.customer.orgName) ? _esc(cfg.customer.orgName) : 'Customer';

  const date = new Date().toLocaleDateString('en-GB', {year:'numeric',month:'long',day:'numeric'});

  const dbox = PRODUCT_CATALOG.dboxModels.find(m=>m.id===(s.dboxModel||'ceres-df3015')) || PRODUCT_CATALOG.dboxModels[0];

  const swModel = PRODUCT_CATALOG.switchModels.find(m=>m.id===(s.backendSwitchModel||'arista-7050cx3')) || PRODUCT_CATALOG.switchModels[0];

  const cnodeCount = r.cnodeCount || 4;

  const dnodeCount = r.dnodeCount || 2;

  const mgmtSubnet = n.mgmtSubnet || '192.168.10.0/24';

  const backendSubnet = n.backendSubnet || '172.16.100.0/22';

  const frontendSubnet = n.frontendSubnet || '10.100.20.0/24';

  const vlanMgmt = n.vlanMgmt || 10;

  const vlanBackend = n.vlanBackend || 100;

  const vlanFrontend = n.vlanFrontend || 20;

  const mtu = n.mtu || 9000;

  const vipStart = p.vipStart || '10.100.20.100';

  const clusterName = p.clusterName || 'vast-cluster-01';



  // Build IP table rows

  let ipRows = '';

  for (let i = 0; i < cnodeCount; i++) {

    ipRows += `<tr><td>cnode-${i+1}-mgmt</td><td>CNode ${i+1} Management</td><td>eth0 (OOB)</td><td>${mgmtSubnet.split('/')[0].replace(/\.\d+$/, '.'+(10+i))}</td><td>VLAN ${vlanMgmt}</td><td>1500</td></tr>`;

    ipRows += `<tr><td>cnode-${i+1}-backend</td><td>CNode ${i+1} Backend Fabric</td><td>eth1 (200GbE)</td><td>${backendSubnet.split('/')[0].replace(/\.\d+$/, '.'+(10+i))}</td><td>VLAN ${vlanBackend}</td><td>${mtu}</td></tr>`;

  }

  for (let i = 0; i < dnodeCount; i++) {

    ipRows += `<tr><td>dnode-${i+1}-mgmt</td><td>DNode (Ceres) ${i+1} DPU Mgmt</td><td>eth0 (OOB)</td><td>${mgmtSubnet.split('/')[0].replace(/\.\d+$/, '.'+(50+i))}</td><td>VLAN ${vlanMgmt}</td><td>1500</td></tr>`;

    ipRows += `<tr><td>dnode-${i+1}-fabric-a</td><td>DNode ${i+1} D-Tray A</td><td>200GbE → SwA</td><td>${backendSubnet.split('/')[0].replace(/\.\d+$/, '.'+(50+i))}</td><td>VLAN ${vlanBackend}</td><td>${mtu}</td></tr>`;

    ipRows += `<tr><td>dnode-${i+1}-fabric-b</td><td>DNode ${i+1} D-Tray B</td><td>200GbE → SwB</td><td>${backendSubnet.split('/')[0].replace(/\.\d+$/, '.'+(80+i))}</td><td>VLAN ${vlanBackend}</td><td>${mtu}</td></tr>`;

  }



  return `

  <h1>Low-Level Design — VAST Enterprise Storage</h1>

  <p class="doc-meta">Customer: ${org} &nbsp;|&nbsp; Date: ${date} &nbsp;|&nbsp; Version: 1.0 &nbsp;|&nbsp; Classification: Confidential</p>

  <div class="doc-section">

    <h2>1. Hardware Specifications</h2>

    <table class="cabling-table">

      <thead><tr><th>Component</th><th>Specification</th><th>Qty</th><th>RU</th><th>Power</th></tr></thead>

      <tbody>

        <tr><td>VAST CBox (Standard)</td><td>4× CNodes per chassis; AMD EPYC 9555P "Turin" 64-core; 384GB DDR5-6400; 4× 200GbE NDR per node</td><td>${Math.ceil(cnodeCount/4)}</td><td>${Math.ceil(cnodeCount/4)*2}U</td><td>${Math.ceil(cnodeCount/4)*4*800}W</td></tr>

        <tr><td>${_esc(dbox.name)}</td><td>${dbox.qlcCapacityTB}TB QLC NVMe + ${dbox.scmCapacityTB}TB SCM; NVIDIA BlueField-3 DPU; 2× Active/Active D-Trays; Dual 1600W PSU</td><td>${dnodeCount}</td><td>${dnodeCount}U</td><td>${dnodeCount*1600}W</td></tr>

        <tr><td>${_esc(swModel.name)} (×2 redundant)</td><td>${_esc(swModel.ports)}; ${_esc(swModel.fabricType)} fabric; ${swModel.bufferMB}MB buffer</td><td>2</td><td>2U</td><td>~800W</td></tr>

        <tr><td>OOB Management Switch</td><td>1GbE, 24-48 ports</td><td>1</td><td>1U</td><td>~50W</td></tr>

      </tbody>

    </table>

  </div>

  <div class="doc-section">

    <h2>2. Network Addressing Plan</h2>

    <table class="cabling-table">

      <thead><tr><th>Hostname</th><th>Role</th><th>Interface</th><th>IP Address</th><th>VLAN</th><th>MTU</th></tr></thead>

      <tbody>

        ${ipRows}

        <tr><td>switch-a-mgmt</td><td>Backend Fabric Switch A</td><td>Mgmt0</td><td>${mgmtSubnet.split('/')[0].replace(/\.\d+$/, '.200')}</td><td>VLAN ${vlanMgmt}</td><td>1500</td></tr>

        <tr><td>switch-b-mgmt</td><td>Backend Fabric Switch B</td><td>Mgmt0</td><td>${mgmtSubnet.split('/')[0].replace(/\.\d+$/, '.201')}</td><td>VLAN ${vlanMgmt}</td><td>1500</td></tr>

        <tr><td>vip-pool</td><td>Client VIP Pool Start</td><td>Virtual</td><td>${_esc(vipStart)}</td><td>VLAN ${vlanFrontend}</td><td>${mtu}</td></tr>

      </tbody>

    </table>

  </div>

  <div class="doc-section">

    <h2>3. Switch Configuration (${_esc(s.fabricType || 'RoCEv2')})</h2>

    <p>The following key settings must be configured on both backend fabric switches. Refer to the ${_esc(swModel.name)} configuration guide for full syntax.</p>

    <pre># --- RoCEv2 / Lossless Fabric Configuration ---

# Apply to BOTH Switch A and Switch B



# 1. Enable Priority Flow Control (PFC) — MANDATORY for RDMA/RoCEv2

dcbx mode host

priority-flow-control mode on

priority-flow-control priority 3 no-drop



# 2. Enable ECN (Explicit Congestion Notification)

qos profile vast-storage

  ecn on

  dscp 26   ! DSCP CS3 for storage traffic



# 3. MTU — set to ${mtu} (Jumbo Frames) on all storage-facing ports

interface Ethernet1-32

  mtu ${mtu}

  switchport trunk allowed vlan ${vlanBackend}

  speed forced 200gfull

  no shutdown



# 4. VLAN definitions

vlan ${vlanBackend}

  name VAST-Backend-Fabric

vlan ${vlanFrontend}

  name VAST-Frontend-Clients

vlan ${vlanMgmt}

  name VAST-Management-OOB</pre>

  </div>

  <div class="doc-section">

    <h2>4. VAST Cluster Configuration Parameters</h2>

    <table class="cabling-table">

      <thead><tr><th>Parameter</th><th>Value</th></tr></thead>

      <tbody>

        <tr><td>Cluster Name</td><td>${_esc(clusterName)}</td></tr>

        <tr><td>VAST AI OS Version</td><td>'+_kbVer()+'</td></tr>

        <tr><td>DNS Server</td><td>${_esc(p.dns || '10.100.20.10')}</td></tr>

        <tr><td>NTP Server</td><td>${_esc(p.ntp || '10.100.20.11')}</td></tr>

        <tr><td>Syslog Server</td><td>${_esc(p.syslog || '10.100.20.12')}</td></tr>

        <tr><td>VIP Pool</td><td>${_esc(vipStart)} → ${_esc(p.vipEnd || '10.100.20.119')} /${_esc(String(p.vipMask || 24))}</td></tr>

        <tr><td>VIP Gateway</td><td>${_esc(p.vipGateway || '10.100.20.1')}</td></tr>

        <tr><td>VIP Load Balance Policy</td><td>${_esc(p.vipPolicy || 'round-robin')}</td></tr>

        <tr><td>Default View Path</td><td>${_esc(p.viewPath || '/data')}</td></tr>

        <tr><td>View Quota</td><td>${_esc(String(p.quotaTB || 100))} TB</td></tr>

        <tr><td>Auth Source</td><td>${_esc(p.authSource || 'local')}</td></tr>

        <tr><td>Protocols Enabled</td><td>${[p.protoNfs3?'NFSv3':'',p.protoNfs4?'NFSv4.1':'',p.protoSmb?'SMB':'',p.protoS3?'S3':'',p.protoNvme?'NVMe/TCP':''].filter(Boolean).join(', ')}</td></tr>

        <tr><td>Data Reduction Target</td><td>${_esc(String(s.reductionRatio || 3.0))}:1</td></tr>

        <tr><td>Erasure Coding</td><td>150+4 (~2.7% overhead)</td></tr>

        <tr><td>HA Configuration</td><td>${s.haConfig ? 'Enabled — HA D-Node pairs' : 'Standard'}</td></tr>

      </tbody>

    </table>

  </div>`;

}



// ----- HLD Generator -----

function _buildHLD() {

  const cfg = AppState.config;

  const r   = cfg.results || {};

  const p   = cfg.provisioning || {};

  const s   = cfg.sizing || {};

  const org = (cfg.customer && cfg.customer.orgName) ? _esc(cfg.customer.orgName) : 'Customer';

  const date = new Date().toLocaleDateString('en-GB', {year:'numeric',month:'long',day:'numeric'});

  const latest = PRODUCT_CATALOG.vastosVersions.find(v=>v.latest) || {version:_kbVer()};

  const dbox = PRODUCT_CATALOG.dboxModels.find(m=>m.id===(s.dboxModel||'ceres-df3015')) || PRODUCT_CATALOG.dboxModels[0];

  const swModel = PRODUCT_CATALOG.switchModels.find(m=>m.id===(s.backendSwitchModel||'arista-7050cx3')) || PRODUCT_CATALOG.switchModels[0];



  var _hldBase = `

  <h1>High-Level Design — VAST Enterprise Storage</h1>

  <p class="doc-meta">Customer: ${org} &nbsp;|&nbsp; Date: ${date} &nbsp;|&nbsp; Version: 1.0 &nbsp;|&nbsp; Classification: Confidential</p>

  <div class="doc-section">

    <h2>1. Introduction</h2>

    <p>This High-Level Design (HLD) document describes the architecture and design of the VAST Enterprise Storage solution proposed for ${org}. The solution is based on the VAST Disaggregated Shared-Everything (DASE) architecture running <strong>VAST AI OS ${_esc(latest.version)}</strong>.</p>

    <p>The design has been sized to deliver <strong>${_esc(String(r.effectiveTB||s.targetUsableTB||'—'))} TB</strong> of usable capacity with a target read throughput of <strong>${_esc(String(r.readThroughputGBs||s.readThroughputGBs||'—'))} GB/s</strong> and write throughput of <strong>${_esc(String(r.writeThroughputGBs||s.writeThroughputGBs||'—'))} GB/s</strong>, leveraging global data reduction at a <strong>${_esc(String(s.reductionRatio||'3.0'))}:1</strong> ratio.</p>

  </div>

  <div class="doc-section">

    <h2>2. DASE Architecture Overview</h2>

    <p>VAST Data's Disaggregated Shared-Everything (DASE) architecture separates stateless compute processing (C-Nodes / CBox) from persistent storage media (D-Nodes / DBox). All CNodes connect to all DNodes over a high-speed NVMe-over-Fabrics (NVMe-oF) backend fabric, exposing a single global namespace to all clients simultaneously.</p>

    <p>Unlike traditional shared-nothing architectures, DASE eliminates inter-node metadata synchronization, enabling linear performance and capacity scaling. Data reduction — combining global similarity detection, LZ4 compression, and deduplication — is applied cluster-wide, with a 150+4 erasure coding scheme providing resilience against 4 simultaneous drive failures with only ~2.7% storage overhead.</p>

  </div>

  <div class="doc-section">

    <h2>3. Solution Components</h2>

    <table class="cabling-table">

      <thead><tr><th>Component</th><th>Model</th><th>Qty</th><th>Role</th></tr></thead>

      <tbody>

        <tr><td>Compute Nodes (CBox)</td><td>VAST CBox (Standard) — AMD EPYC Turin</td><td>${Math.ceil((r.cnodeCount||4)/4)}</td><td>Protocol processing, data reduction, client serving</td></tr>

        <tr><td>Storage Nodes (DBox)</td><td>${_esc(dbox.name)}</td><td>${r.dnodeCount||2}</td><td>QLC NVMe flash storage + SCM write buffers</td></tr>

        <tr><td>Backend Fabric Switches</td><td>${_esc(swModel.name)}</td><td>2</td><td>Redundant NVMe-oF fabric (${_esc(s.fabricType||'RoCEv2')})</td></tr>

        <tr><td>Frontend/Client Switch</td><td>Customer-provided L3 switch</td><td>1+</td><td>Client access network (${_esc(s.clientNet||'100')} GbE)</td></tr>

        <tr><td>OOB Management Switch</td><td>1GbE management switch</td><td>1</td><td>IPMI / BMC out-of-band management</td></tr>

        <tr><td>VAST AI OS</td><td>${_esc(latest.version)}</td><td>—</td><td>Storage OS included with hardware</td></tr>

      </tbody>

    </table>

  </div>

  <div class="doc-section">

    <h2>4. Network Architecture</h2>

    <p><strong>Frontend (Client) Network:</strong> Clients connect to VAST Virtual IPs (VIPs) over ${_esc(s.clientNet||'100')} GbE Ethernet. A minimum of 4 VIPs per CNode is recommended for optimal load distribution. Supported protocols: ${(p.protoNfs3?'NFSv3 ':'')}${(p.protoNfs4?'NFSv4.1 ':'')}${(p.protoSmb?'SMB 3.x ':'')}${(p.protoS3?'S3 ':'')}${(p.protoNvme?'NVMe/TCP':'')}.  </p>

    <p><strong>Backend (Storage) Fabric:</strong> CNodes and DNodes interconnect over a dedicated ${_esc(s.fabricType||'RoCEv2')} network using MTU 9000 (Jumbo Frames). Priority Flow Control (PFC) and Explicit Congestion Notification (ECN) are mandatory for lossless RDMA operation.</p>

    <p><strong>Management Network:</strong> All nodes are connected to a dedicated out-of-band (OOB) 1GbE management network for IPMI/BMC access and the VAST Management System (VMS).</p>

  </div>

  <div class="doc-section">

    <h2>5. Data Protection Strategy</h2>

    <p>The cluster uses VAST's <strong>150+4 erasure coding</strong> scheme (~2.7% overhead) providing protection against simultaneous failure of up to 4 drives cluster-wide. Write traffic is committed to persistent SCM (Storage Class Memory) buffers before acknowledgement, guaranteeing data durability against power events.</p>

    <p>Point-in-time snapshots are implemented using write-in-free-space methodology — zero performance impact, indestructible (admin-lockable for ransomware protection), and configurable per directory.</p>

  </div>

  <div class="doc-section">

    <h2>6. Security</h2>

    <p>Data-at-Rest Encryption (DARE) using 256-bit AES-XTS is ${_esc(s.secDare ? 'enabled' : 'available but not enabled in this design')}. ${s.secKeyMgmt && s.secKeyMgmt !== 'built-in' ? 'External Key Management via ' + _esc(s.secKeyMgmt) + ' (KMIP protocol).' : 'Key management via built-in VAST KMS.'} Multi-tenancy isolation and per-tenant authentication (${p.authSource==='ldap'?'Active Directory / LDAP':'local authentication'}) are configured as described in the LLD.</p>

  </div>

  <div class="doc-section">

    <h2>7. Scalability</h2>

    <p>The DASE architecture enables independent scaling of compute (CNodes) and storage (DBoxes) without data migration or downtime. The cluster can be expanded by adding CBox chassis or Ceres DBox enclosures to the existing backend fabric. Growth projections of ${_esc(String(s.growthRate||20))}% per year have been factored into the sizing, with capacity requirements of approximately <strong>${_esc(String(r.grow3yr||'—'))} TB</strong> raw at the 3-year mark.</p>

  </div>`;

  // ── Replication section (conditional on Panel 4 or Panel 7 BC/DR tab) ──────
  var _hldReplEnabled = _getCheck('bc-enable-replication') ||
                        (_getSelect('replication-target-type') &&
                         _getSelect('replication-target-type') !== 'none');
  var _hldReplMode    = _getSelect('bc-replication-type') === 'sync' ? 'Synchronous (Active-Active)' : 'Asynchronous';
  var _hldReplTgtRaw  = _getSelect('bc-remote-site-type') || _getSelect('replication-target-type') || 'vast-onprem';
  var _hldReplTgtLbl  = {
    'vast-onprem':  'Remote VAST On-Premises Cluster',
    'public-cloud': 'Public Cloud (via VAST Mirror)',
    'aws':  'Amazon Web Services',
    'azure':'Microsoft Azure',
    'gcp':  'Google Cloud Platform'
  }[_hldReplTgtRaw] || 'Remote VAST Cluster';
  var _hldRpoMin    = _getVal('bc-rpo-minutes')       || '15';
  var _hldSnapSched = {'hourly':'Hourly','4h':'Every 4 Hours','daily':'Daily','weekly':'Weekly'}[_getSelect('bc-snapshot-schedule')] || 'Hourly';
  var _hldSnapRet   = _getVal('bc-snapshot-retention') || '30';
  var _hldWanGbps   = _getVal('bc-wan-bandwidth')      || '10';

  var _hldReplSec = '';
  if (_hldReplEnabled) {
    _hldReplSec += '<div class="doc-section">';
    _hldReplSec += '<h2>8. Business Continuity &amp; Replication</h2>';
    _hldReplSec += '<p>This design includes <strong>VAST Mirror ' + _hldReplMode + '</strong> replication to provide resilience against site-level failures. VAST Mirror replicates at the file and directory level, maintaining a consistent secondary copy with an RPO target of <strong>' + _hldRpoMin + ' minutes</strong>.</p>';
    _hldReplSec += '<table class="cabling-table"><thead><tr><th>Parameter</th><th>Configured Value</th><th>Notes</th></tr></thead><tbody>';
    _hldReplSec += '<tr><td>Mirror Mode</td><td>' + _hldReplMode + '</td><td>' + (_hldReplMode.indexOf('Sync') >= 0 ? 'Requires &lt;5ms WAN RTT between sites' : 'Eventual consistency — suitable for most RPO targets') + '</td></tr>';
    _hldReplSec += '<tr><td>Replication Target</td><td>' + _hldReplTgtLbl + '</td><td>Secondary cluster must be pre-configured identically</td></tr>';
    _hldReplSec += '<tr><td>RPO Target</td><td><strong>' + _hldRpoMin + ' minutes</strong></td><td>Maximum acceptable data loss window</td></tr>';
    _hldReplSec += '<tr><td>Snapshot Schedule</td><td>' + _hldSnapSched + '</td><td>Point-in-time recovery anchors on primary cluster</td></tr>';
    _hldReplSec += '<tr><td>Snapshot Retention</td><td>' + _hldSnapRet + ' days</td><td>Local copies retained on primary</td></tr>';
    _hldReplSec += '<tr><td>WAN Bandwidth Available</td><td>' + _hldWanGbps + ' Gbps</td><td>Must exceed: daily change rate / RPO window</td></tr>';
    _hldReplSec += '<tr><td>Replication Port</td><td>TCP 443 (HTTPS)</td><td>Management network; no additional ports required</td></tr>';
    _hldReplSec += '</tbody></table>';
    _hldReplSec += '<div class="highlight-box"><strong>Failover Procedure:</strong> Documented in the BC/DR Runbook (Panel 10). Planned failover: quiesce applications &rarr; force a final snapshot &rarr; execute <code>vcli admin&gt; protectedpath force-failover</code> on the DR cluster. RTO depends on DNS propagation time and client remount latency.</div>';
    _hldReplSec += '</div>';
  }

  // ── Cold Tier section (conditional) ────────────────────────────────────────
  var _hldTierEnabled  = _getCheck('cold-tier-enabled') || _getCheck('tier-enable');
  var _hldTierPrvRaw   = _getSelect('cold-tier-provider') || _getSelect('tier-provider') || 'aws';
  var _hldTierPrvLbl   = {'aws':'Amazon S3','azure':'Microsoft Azure Blob Storage','gcp':'Google Cloud Storage','onprem':'On-Premises S3 (MinIO / Ceph)'}[_hldTierPrvRaw] || 'Cloud Object Storage';
  var _hldTierUsable   = _getVal('cold-tier-usable') || '—';
  var _hldTierClassLbl = {'cool':'Cool / Infrequent Access','cold':'Cold / Glacier','archive':'Archive (retrieval delay applies)'}[_getSelect('cold-tier-class')] || 'Cool';
  var _hldTierBucket   = _getVal('tier-bucket') || 'vast-cold-tier-bucket';
  var _hldTierPolLbl   = {'age':'Age-based (moved after inactivity threshold)','capacity':'Capacity-based (triggered at high-watermark)','manual':'Manual (administrator-initiated)'}[_getSelect('tier-policy') || _getSelect('cold-tier-policy')] || 'Capacity-based';
  var _hldTierSecNum   = _hldReplEnabled ? '9' : '8';

  var _hldColdSec = '';
  if (_hldTierEnabled) {
    _hldColdSec += '<div class="doc-section">';
    _hldColdSec += '<h2>' + _hldTierSecNum + '. Cloud Tiering</h2>';
    _hldColdSec += '<p>This design includes <strong>VAST Cloud Tiering</strong> to automatically move cold or infrequently-accessed data to lower-cost object storage, freeing NVMe capacity for active workloads while maintaining a unified namespace. Tiered data remains transparently accessible to all clients — no application changes required.</p>';
    _hldColdSec += '<table class="cabling-table"><thead><tr><th>Parameter</th><th>Configured Value</th><th>Notes</th></tr></thead><tbody>';
    _hldColdSec += '<tr><td>Tier Provider</td><td>' + _hldTierPrvLbl + '</td><td>Target object store for cold data</td></tr>';
    _hldColdSec += '<tr><td>Cold Tier Capacity</td><td>' + _hldTierUsable + ' TB (logical)</td><td>Object storage billed per GB consumed</td></tr>';
    _hldColdSec += '<tr><td>Storage Class</td><td>' + _hldTierClassLbl + '</td><td>Note: Archive classes incur retrieval delay and cost</td></tr>';
    _hldColdSec += '<tr><td>Tiering Policy</td><td>' + _hldTierPolLbl + '</td><td>Automatically enforced by VAST DataStore engine</td></tr>';
    _hldColdSec += '<tr><td>Target Bucket</td><td><code>' + _hldTierBucket + '</code></td><td>Bucket must exist; VAST creates object keys, not the bucket</td></tr>';
    _hldColdSec += '<tr><td>Connectivity</td><td>TCP 443 (HTTPS) outbound</td><td>All C-Nodes require outbound HTTPS to cloud endpoint</td></tr>';
    _hldColdSec += '</tbody></table>';
    _hldColdSec += '<div class="highlight-box"><strong>Transparency:</strong> Tiered data appears at the same namespace path via NFS, SMB, and S3. VAST DataStore retrieves objects on-demand on first access — transparent to all clients, with potential first-access latency for archived tier data.</div>';
    _hldColdSec += '</div>';
  }

  return _hldBase + _hldReplSec + _hldColdSec;

}



// ----- ATP Generator -----

function _buildATP() {

  var cfg = AppState.config;

  var r   = cfg.results || {};

  var p   = cfg.provisioning || {};

  var s   = cfg.sizing || {};

  var adv = cfg.advanced || {};

  var org = (cfg.customer && cfg.customer.orgName) ? _esc(cfg.customer.orgName) : 'Customer';

  var clN = p.clusterName || 'vast-cluster-01';

  var vipS= p.vipStart    || '10.100.20.100';

  var vPath=p.viewPath    || '/data';

  var rGBs= r.readThroughputGBs  || s.readThroughputGBs  || 40;

  var wGBs= r.writeThroughputGBs || s.writeThroughputGBs || 10;

  var cc  = r.cnodeCount  || 4;

  var dc  = r.dnodeCount  || 2;

  var eTB = r.effectiveTB || s.targetUsableTB || 500;

  var date= new Date().toLocaleDateString('en-GB', {year:'numeric',month:'long',day:'numeric'});

  var dare= adv.secDare !== false;

  var nfs = p.protoNfs3 !== false || p.protoNfs4 !== false;

  var smb = p.protoSmb || false;

  var s3  = p.protoS3  || false;

  var repl= adv.bcEnabled || _getCheck('bc-enable-replication') ||
             (_getSelect('replication-target-type') &&
              _getSelect('replication-target-type') !== 'none') || false;

  var quotaTB = p.quotaTB || 100;



  var ROW = function(n, cat, test, expected) {

    return '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">'

      + '<td style="padding:0.5rem 0.75rem;font-weight:600;color:#A7F3D0;">' + n + '</td>'

      + '<td style="padding:0.5rem 0.75rem;font-size:0.78rem;color:#6366F1;">' + cat + '</td>'

      + '<td style="padding:0.5rem 0.75rem;font-size:0.82rem;">' + test + '</td>'

      + '<td style="padding:0.5rem 0.75rem;font-size:0.82rem;color:#10B981;">' + expected + '</td>'

      + '<td style="padding:0.5rem 0.75rem;font-size:0.82rem;color:#6B7280;font-style:italic;">___</td>'

      + '<td style="padding:0.5rem 0.75rem;text-align:center;color:#F59E0B;">&#9633;</td>'

      + '</tr>';

  };

  var cb = function(c) {

    return '<pre style="background:#040608;border:1px solid rgba(16,185,129,0.2);border-radius:6px;padding:0.75rem 1rem;font-family:JetBrains Mono,monospace;font-size:0.78rem;color:#10B981;line-height:1.6;margin:0.5rem 0;overflow-x:auto;white-space:pre;">' + c + '</pre>';

  };

  var TH = '<thead><tr><th>#</th><th>Category</th><th>Test</th><th>Expected Result</th><th>Actual Result</th><th>Pass?</th></tr></thead>';

  var TH5 = '<thead><tr><th>#</th><th>Test</th><th>Acceptance Criteria</th><th>Actual Result</th><th>Pass?</th></tr></thead>';

  var protoList = [nfs ? 'NFS' : '', smb ? 'SMB' : '', s3 ? 'S3' : ''].filter(Boolean).join(', ') || 'NFS';

  var out = '';



  out += '<h1>Acceptance Test Plan (ATP) &mdash; VAST Enterprise Storage</h1>';

  out += '<p class="doc-meta">Customer: ' + org + ' &nbsp;|&nbsp; Cluster: ' + clN + ' &nbsp;|&nbsp; Date: ' + date + ' &nbsp;|&nbsp; Version: 1.0</p>';

  out += '<p style="font-size:0.85rem;color:#9CA3AF;margin-bottom:2rem;">This ATP defines mandatory tests for the VAST Data storage cluster. All tests must be signed off before the engagement is complete. Reference: VAST AI OS Admin Guide | FIO: https://fio.readthedocs.io/</p>';



  out += '<div class="doc-section"><h2>1. Environment Summary</h2>';

  out += '<table class="cabling-table"><thead><tr><th>Parameter</th><th>Specification</th><th>Value</th></tr></thead><tbody>';

  out += '<tr><td>Cluster Name</td><td>VAST cluster hostname</td><td><strong>' + clN + '</strong></td></tr>';

  out += '<tr><td>VAST AI OS Version</td><td>Installed OS</td><td>'+_kbVer()+'</td></tr>';

  out += '<tr><td>C-Nodes</td><td>Stateless compute</td><td><strong>' + cc + ' CNodes</strong></td></tr>';

  out += '<tr><td>D-Nodes</td><td>NVMe storage enclosures</td><td><strong>' + dc + ' DNodes (Ceres)</strong></td></tr>';

  out += '<tr><td>Usable Capacity</td><td>After data reduction</td><td><strong>' + eTB.toFixed(1) + ' TB</strong></td></tr>';

  out += '<tr><td>VIP Pool Start</td><td>Client-facing floating IPs</td><td><strong>' + vipS + '</strong></td></tr>';

  out += '<tr><td>Target Read</td><td>Aggregate across all clients</td><td><strong>' + rGBs + ' GB/s</strong></td></tr>';

  out += '<tr><td>Target Write</td><td>Aggregate across all clients</td><td><strong>' + wGBs + ' GB/s</strong></td></tr>';

  out += '<tr><td>Protocols</td><td>Enabled client protocols</td><td>' + protoList + '</td></tr>';

  out += '<tr><td>DARE Encryption</td><td>AES-256-GCM at rest</td><td>' + (dare ? '&#10003; Enabled' : '&#10007; Disabled') + '</td></tr>';

  out += '<tr><td>View Quota</td><td>Storage limit</td><td>' + quotaTB + ' TB</td></tr>';

  out += '</tbody></table></div>';



  out += '<div class="doc-section"><h2>2. Hardware Verification</h2>';

  out += '<table class="cabling-table">' + TH + '<tbody>';

  out += ROW('H-01', 'Hardware', 'All C-Nodes visible: <code>vcli admin&gt; node list</code>', cc + ' CNodes with status ONLINE');

  out += ROW('H-02', 'Hardware', 'All D-Nodes visible: <code>vcli admin&gt; node list --type dnode</code>', dc + ' DNodes with status ONLINE');

  out += ROW('H-03', 'Hardware', 'Cluster health: <code>vcli admin&gt; cluster list</code>', 'No CRITICAL or ERROR alerts');

  out += ROW('H-04', 'Hardware', 'NVMe drives healthy: <code>vcli admin&gt; drive list</code>', 'All drives ONLINE, none FAILED');

  out += ROW('H-05', 'Hardware', 'VAST AI OS version: <code>vcli admin&gt; node show</code>', 'VAST AI OS '+_kbVer()+' on all nodes');

  out += ROW('H-06', 'Hardware', 'Dual PSU on all D-Nodes', 'Both PSUs PRESENT and HEALTHY per DNode');

  out += '</tbody></table></div>';



  out += '<div class="doc-section"><h2>3. Network Verification</h2>';

  out += '<table class="cabling-table">' + TH + '<tbody>';

  out += ROW('N-01', 'Network', 'Ping VIP from 3 separate clients', '&lt; 1ms RTT, 0% packet loss');

  out += ROW('N-02', 'Network', 'iperf3 client-to-VIP: <code>iperf3 -c ' + vipS + ' -P 8 -t 30</code>', '&ge; line rate (limited by client NIC)');

  out += ROW('N-03', 'Network', 'Jumbo frame test: <code>ping -M do -s 8972 ' + vipS + '</code>', 'Frames pass without fragmentation (MTU 9000)');

  out += ROW('N-04', 'Network', 'VIP load balancing (4+ clients simultaneous)', 'Connections distributed across all CNodes');

  out += ROW('N-05', 'Network', 'DNS resolution: <code>nslookup ' + clN + '</code>', 'Returns management IP without error');

  out += ROW('N-06', 'Network', 'NTP sync: <code>chronyc tracking</code> on all nodes', 'Time within 50ms of NTP server on all nodes');

  out += '</tbody></table></div>';



  out += '<div class="doc-section"><h2>4. Storage Protocol Tests</h2>';

  out += '<table class="cabling-table">' + TH + '<tbody>';

  if (nfs) {

    out += ROW('P-01', 'NFS', 'Mount NFSv3: <code>mount -t nfs -o vers=3,nconnect=8 ' + vipS + ':' + vPath + ' /mnt/test</code>', 'Mount succeeds, share shows ' + eTB.toFixed(0) + ' TB capacity');

    out += ROW('P-02', 'NFS', 'Mount NFSv4.1 (if enabled)', 'Mount succeeds, share accessible');

    out += ROW('P-03', 'NFS', 'File create/delete: <code>touch /mnt/test/atp-test.txt</code>', 'File created, visible, and deleted successfully');

  }

  if (smb) {

    out += ROW('P-04', 'SMB', 'SMB mount from Windows: <code>net use V: \\\\\\\\' + vipS + '\\\\' + vPath.replace('/','') + '</code>', 'Drive mapped, R/W access confirmed');

  }

  if (s3) {

    out += ROW('P-05', 'S3', 'S3 list: <code>aws s3 ls --endpoint-url http://' + vipS + ':9000</code>', 'Bucket list returned without error');

    out += ROW('P-06', 'S3', 'S3 put/get 1GB object, verify checksum', 'SHA256 checksum matches on download');

  }

  if (_getCheck('cold-tier-enabled') || _getCheck('tier-enable')) {

    var _atpTierPrv = ({'aws':'Amazon S3','azure':'Azure Blob','gcp':'GCS','onprem':'On-Prem S3'}[_getSelect('cold-tier-provider') || _getSelect('tier-provider')] || 'Cloud');
    out += ROW('CT-01', 'Cold Tier', 'Verify tiering connectivity: C-Nodes can reach ' + _atpTierPrv + ' endpoint on TCP 443', 'curl -I https://[provider-endpoint] returns 200 or 403 (reachable)');
    out += ROW('CT-02', 'Cold Tier', 'Trigger manual tier of test file, verify moved to cloud: <code>vcli admin&gt; datastore list</code>', 'File object appears in cloud bucket; local VAST shows data as TIERED');
    out += ROW('CT-03', 'Cold Tier', 'Read tiered file from client (NFS/SMB)', 'File reads successfully; data retrieved from cloud tier transparently');

  }

  out += ROW('P-07', 'Quota', 'Write to quota limit, verify hard block at ' + quotaTB + ' TB', 'Soft warning at ' + Math.round(quotaTB*0.9) + ' TB, hard block at ' + quotaTB + ' TB');

  out += '</tbody></table></div>';



  out += '<div class="doc-section"><h2>5. Performance Benchmarks</h2>';

  out += '<p style="font-size:0.85rem;color:#9CA3AF;">Run FIO from mounted NFS on 2+ client hosts simultaneously and sum results. Reference: https://fio.readthedocs.io/</p>';



  out += '<h3>5.1 Sequential Read</h3>';

  out += cb('fio --name=vast-atp-read \\\n    --filename=/mnt/vast/fio-seq-read \\\n    --size=100G --numjobs=32 --rw=read --bs=1M --direct=1 \\\n    --ioengine=libaio --iodepth=64 --group_reporting --runtime=60');

  out += '<table class="cabling-table">' + TH5 + '<tbody>';

  out += '<tr><td>B-01</td><td>Sequential Read throughput</td><td>&ge; ' + rGBs + ' GB/s aggregate</td><td>___ GB/s</td><td>&#9633;</td></tr>';

  out += '<tr><td>B-02</td><td>Read latency average</td><td>&lt; 2ms</td><td>___ ms</td><td>&#9633;</td></tr>';

  out += '</tbody></table>';



  out += '<h3>5.2 Sequential Write</h3>';

  out += cb('fio --name=vast-atp-write \\\n    --filename=/mnt/vast/fio-seq-write \\\n    --size=100G --numjobs=32 --rw=write --bs=1M --direct=1 \\\n    --ioengine=libaio --iodepth=64 --group_reporting --runtime=60');

  out += '<table class="cabling-table">' + TH5 + '<tbody>';

  out += '<tr><td>B-03</td><td>Sequential Write throughput</td><td>&ge; ' + wGBs + ' GB/s aggregate</td><td>___ GB/s</td><td>&#9633;</td></tr>';

  out += '<tr><td>B-04</td><td>Write latency average</td><td>&lt; 5ms</td><td>___ ms</td><td>&#9633;</td></tr>';

  out += '</tbody></table>';



  out += '<h3>5.3 Random 4K IOPS</h3>';

  out += cb('fio --name=vast-atp-rand \\\n    --filename=/mnt/vast/fio-rand \\\n    --size=20G --numjobs=16 --rw=randread --bs=4k --direct=1 \\\n    --ioengine=libaio --iodepth=256 --group_reporting --runtime=60');

  out += '<table class="cabling-table">' + TH5 + '<tbody>';

  out += '<tr><td>B-05</td><td>4K Random Read IOPS</td><td>&ge; 500K IOPS aggregate</td><td>___ IOPS</td><td>&#9633;</td></tr>';

  out += '<tr><td>B-06</td><td>4K Read Latency p99</td><td>&lt; 1ms (1000&mu;s)</td><td>___ &mu;s</td><td>&#9633;</td></tr>';

  out += '</tbody></table></div>';



  out += '<div class="doc-section"><h2>6. Security &amp; Compliance</h2>';

  out += '<table class="cabling-table">' + TH + '<tbody>';

  if (dare) {

    out += ROW('S-01', 'Encryption', 'Verify DARE: <code>vcli admin&gt; cluster show | grep encrypt</code>', 'Encryption: ENABLED, FIPS 140-3');

  }

  out += ROW('S-02', 'Access', 'Un-authenticated user cannot access NFS share', 'Permission denied without valid credentials');

  out += ROW('S-03', 'Audit', 'Verify audit events logged on file access', 'Events visible in syslog');

  if (repl) {

    var _atpRpo = adv.bcRPOMinutes || parseInt(_getVal('bc-rpo-minutes') || '15');
    var _atpWan = adv.bcWanBandwidthGbps || parseFloat(_getVal('bc-wan-bandwidth') || '10');
    var _atpReplMode = adv.bcReplicationType || _getSelect('bc-replication-type') || 'async';

    out += ROW('S-04', 'Replication', 'Verify replication status: <code>vcli admin&gt; protectedpath list</code>', 'Status: SYNCED; lag &lt; ' + _atpRpo + ' min RPO target');

    out += ROW('S-05', 'Replication', 'Verify remote server registered: <code>vcli admin&gt; remoteserver list</code>', 'Remote server entry present; status: CONNECTED');

    out += ROW('S-06', 'Replication', 'Force snapshot, verify appears on DR: <code>vcli admin&gt; snapshot create --policy-name *snap-policy</code>', 'Snapshot visible on DR cluster within ' + _atpRpo + ' min');

  }

  out += ROW('S-05', 'Snapshot', 'Snapshot created: <code>vcli admin&gt; snapshot list</code>', 'Snapshot exists for ' + vPath);

  out += ROW('S-06', 'Snapshot', 'Snapshot restore: create, snapshot, delete, restore', 'File restored successfully from snapshot');

  out += '</tbody></table></div>';



  out += '<div class="doc-section"><h2>7. High Availability Tests</h2>';

  out += '<table class="cabling-table">' + TH + '<tbody>';

  out += ROW('HA-01', 'HA', 'Power off one CNode during active FIO test', 'IO resumes within 30s, VIP migrates, no data loss');

  out += ROW('HA-02', 'HA', 'Unplug one frontend cable during active IO', 'IO resumes within 30s via redundant path');

  out += ROW('HA-03', 'HA', 'Graceful CNode restart: <code>vcli admin&gt; node reboot --node cnode-01</code>', 'CNode rejoins within 10 min, IO uninterrupted');

  out += ROW('HA-04', 'HA', 'Verify dual PSU on all D-Nodes', 'Both PSUs present, AC input OK on all DNodes');

  out += '</tbody></table></div>';



  // ── Full DR / Replication ATP section (when replication enabled) ─────────────
  if (repl) {
    var _drRpo    = parseInt(_getVal('bc-rpo-minutes') || '15');
    var _drWan    = parseFloat(_getVal('bc-wan-bandwidth') || '10');
    var _drIsSync = (_getSelect('bc-replication-type') === 'sync');

    out += '<div class="doc-section"><h2>8. Replication &amp; Disaster Recovery Tests</h2>';
    out += '<p style="font-size:0.85rem;color:#9CA3AF;">RPO: ' + _drRpo + ' min | Mode: ' + (_drIsSync ? 'Synchronous' : 'Asynchronous') + ' | WAN: ' + _drWan + ' Gbps</p>';
    out += '<table class="cabling-table">' + TH + '<tbody>';
    out += ROW('DR-01', 'Connectivity', 'Ping DR management IP from primary C-Node', '0% packet loss; RTT ' + (_drIsSync ? '&lt; 5ms' : '&lt; 50ms'));
    out += ROW('DR-02', 'Replication',  'Check remoteserver: <code>vcli admin&gt; remoteserver list</code>', 'Status: CONNECTED; no auth errors');
    out += ROW('DR-03', 'Replication',  'Idle lag check: <code>vcli admin&gt; protectedpath list</code>', 'Lag &lt; ' + _drRpo + ' min; status SYNCED');
    out += ROW('DR-04', 'Replication',  'Lag under load: run FIO write 5 min, then check lag', 'Lag &lt; ' + Math.round(_drRpo * 2) + ' min under sustained write');
    out += ROW('DR-05', 'Bandwidth',    'Monitor WAN during peak replication', 'WAN &lt; ' + Math.round(_drWan * 0.8) + ' Gbps (80% of ' + _drWan + ' Gbps available)');
    out += ROW('DR-06', 'Failover',     'Planned failover: <code>vcli admin&gt; protectedpath force-failover</code> on DR cluster', 'DR serves data; clients remount; no data corruption');
    out += ROW('DR-07', 'Data Check',   'Spot-check 100 file checksums primary vs. DR after sync', '100% checksum match');
    out += ROW('DR-08', 'Failback',     'Reverse mirror, sync, failover back to primary', 'Primary resumes; no loss of DR-period changes');
    out += '</tbody></table></div>';
  }

    out += '<div class="doc-section"><h2>' + (repl ? '9' : '8') + '. Sign-Off</h2>';

  out += '<table class="cabling-table"><thead><tr><th>Role</th><th>Name</th><th>Signature</th><th>Date</th></tr></thead><tbody>';

  out += '<tr><td>VAST Solutions Engineer</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';

  out += '<tr><td>Customer Storage Team Lead</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';

  out += '<tr><td>Customer IT Manager</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';

  out += '<tr><td>VAST Account Executive</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';

  out += '</tbody></table>';

  out += '<div class="highlight-box" style="margin-top:1.5rem;"><strong>Acceptance Statement:</strong> All tests completed and acceptance criteria met. The VAST storage cluster for ' + org + ' is accepted into production. Generated by VASTbuilder v2.0 &mdash; &copy; 2024&ndash;2026 Eugene Beauzec.</div>';

  out += '</div>';



  return out;

}



// ----- BC/DR Runbook Generator -----

function _buildBCDRRunbook() {

  var cfg  = AppState.config;

  var adv  = cfg.advanced || {};

  var p    = cfg.provisioning || {};

  var r    = cfg.results || {};

  var s    = cfg.sizing || {};

  var org  = (cfg.customer && cfg.customer.orgName) ? _esc(cfg.customer.orgName) : 'Customer';

  var clN  = p.clusterName || 'vast-cluster-01';

  var vipS = p.vipStart    || '10.100.20.100';

  var vPath= p.viewPath    || '/data';

  var date = new Date().toLocaleDateString('en-GB', {year:'numeric',month:'long',day:'numeric'});

  var repl      = adv.bcEnabled || false;

  var replType  = adv.bcReplicationType || 'async';

  var remoteIP  = adv.bcRemoteClusterIP || '<DR-CLUSTER-IP>';

  var remoteClN = adv.bcRemoteClusterName || clN + '-dr';

  var rpoMin    = adv.bcRPOMinutes || 60;

  var snapSch   = adv.bcSnapshotSchedule || 'hourly';

  var snapRet   = adv.bcSnapshotRetentionDays || 30;

  var wanGbps   = adv.bcWanBandwidthGbps || 10;

  var eTB       = r.effectiveTB || s.targetUsableTB || 500;

  var dailyChg  = (cfg.workload && cfg.workload.changeRate) || 10;

  var dailyGB   = Math.round(eTB * dailyChg / 100 * 1024);

  var wanReqGbps= (dailyGB / (24 * 3600) * 8).toFixed(2);

  var snapSchedVCLI = (snapSch === 'hourly') ? '1 hour' : (snapSch.indexOf('4') !== -1 ? '4 hours' : (snapSch === 'daily' ? '1 day' : '1 week'));

  var rtoStr    = rpoMin <= 15 ? '<15 min' : (rpoMin <= 60 ? '<1 Hour' : '<4 Hours');

  var cc = r.cnodeCount || 4;

  var dc = r.dnodeCount || 2;

  function cb(c) { return '<pre style="background:#040608;border:1px solid rgba(99,102,241,0.25);border-radius:6px;padding:0.9rem 1.1rem;font-family:JetBrains Mono,monospace;font-size:0.79rem;color:#10B981;line-height:1.65;margin:0.5rem 0;overflow-x:auto;white-space:pre;">' + c + '</pre>'; }

  function warn(t) { return '<div style="background:rgba(239,68,68,0.07);border-left:3px solid #EF4444;border-radius:0 6px 6px 0;padding:0.75rem 1rem;margin:0.75rem 0;font-size:0.84rem;color:#FCA5A5;">' + t + '</div>'; }

  function note(t) { return '<div style="background:rgba(245,158,11,0.07);border-left:3px solid #F59E0B;border-radius:0 6px 6px 0;padding:0.75rem 1rem;margin:0.75rem 0;font-size:0.84rem;color:#FCD34D;">' + t + '</div>'; }

  function info(t) { return '<div style="background:rgba(16,185,129,0.06);border-left:3px solid #10B981;border-radius:0 6px 6px 0;padding:0.75rem 1rem;margin:0.75rem 0;font-size:0.84rem;color:#A7F3D0;">' + t + '</div>'; }

  function h2(t)   { return '<h2 style="color:#10B981;font-size:1.15rem;font-weight:700;margin:2rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.07);">' + t + '</h2>'; }

  function h3(t)   { return '<h3 style="color:#A7F3D0;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">' + t + '</h3>'; }

  var wanWarn = (parseFloat(wanReqGbps) > wanGbps) ? warn('WAN required (' + wanReqGbps + ' Gbps) exceeds available (' + wanGbps + ' Gbps). Replication lag may exceed RPO.') : info('WAN bandwidth sufficient for continuous replication.');

  var out = '';

  out += '<h1>BC/DR Operational Runbook &mdash; VAST Enterprise Storage</h1>';

  out += '<p class="doc-meta">Customer: ' + org + ' &nbsp;|&nbsp; Cluster: ' + clN + ' &nbsp;|&nbsp; Date: ' + date + '</p>';

  out += '<p style="font-size:0.85rem;color:#9CA3AF;margin-bottom:2rem;">BC/DR procedures: monitoring, planned failover, unplanned DR, failback, monthly DR tests. Reference: VAST Admin Guide | https://kb.vastdata.com/</p>';

  out += '<div class="doc-section">';

  out += h2('1. BC/DR Architecture Overview');

  out += '<table class="cabling-table"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>';

  out += '<tr><td>Primary Site</td><td><strong>' + clN + '</strong> (' + cc + 'x CNodes, ' + dc + 'x DNodes)</td></tr>';

  out += '<tr><td>DR Site</td><td><strong>' + (repl ? remoteClN + ' at ' + remoteIP : 'Not configured') + '</strong></td></tr>';

  out += '<tr><td>Replication Type</td><td>' + (replType === 'sync' ? 'Synchronous Mirror (RPO=0)' : 'Asynchronous Mirror (RPO=~' + rpoMin + ' min)') + '</td></tr>';

  out += '<tr><td>RPO Target</td><td><strong>' + rpoMin + ' minutes</strong></td></tr>';

  out += '<tr><td>RTO Target</td><td><strong>' + rtoStr + '</strong></td></tr>';

  out += '<tr><td>Snapshot Schedule</td><td>' + snapSch + ' (' + snapRet + ' days retention)</td></tr>';

  out += '<tr><td>Dataset Size</td><td>' + eTB.toFixed(1) + ' TB usable</td></tr>';

  out += '<tr><td>Daily Change Rate</td><td>' + dailyChg + '% = ~' + dailyGB.toLocaleString() + ' GB/day</td></tr>';

  out += '<tr><td>WAN Required</td><td><strong>' + wanReqGbps + ' Gbps</strong> continuous | Available: ' + wanGbps + ' Gbps</td></tr>';

  out += '</tbody></table>';

  out += wanWarn;

  out += '</div>';

  out += '<div class="doc-section">';

  out += h2('2. Daily Monitoring Checks');

  out += cb('# Check cluster health\nvcli admin> cluster list\n\n# Check replication status and lag\nvcli admin> protectedpath list\n# Replication Lag should be < ' + rpoMin + ' minutes\n\n# Check snapshot inventory\nvcli admin> snapshot list --policy-name "' + clN + '-snap-policy"\n\n# Verify DR site connectivity\nvcli admin> remoteserver list');

  out += note('VAST REST API at https://' + vipS + '/api &mdash; integrate with Prometheus/Grafana, Zabbix, or Datadog.');

  out += '</div>';

  out += '<div class="doc-section">';

  out += h2('3. Planned Failover Procedure');

  out += note('Use for scheduled primary site maintenance. Both sites must be healthy and in-sync.');

  out += h3('3.1 Pre-Failover Checks');

  out += cb('# Verify replication in sync (lag near 0)\nvcli admin> protectedpath list\n\n# Notify users of planned maintenance window\n# Quiesce applications (stop all writes to primary)\n\n# Force a final snapshot\nvcli admin> snapshot create \\\n  --policy-name "' + clN + '-snap-policy" \\\n  --comment "Pre-planned-failover-snapshot"');

  out += h3('3.2 Initiate Planned Failover');

  out += cb('# On PRIMARY cluster:\nvcli admin> protectedpath promote \\\n  --name "' + clN + '-data-snap" \\\n  --planned\n\n# Monitor: SYNCED -> FAILING_OVER -> FAILED_OVER\nvcli admin> protectedpath list\n\n# When FAILED_OVER: re-mount clients at DR site VIP (' + remoteIP + ')');

  out += h3('3.3 Client Re-mount at DR Site');

  out += cb('# Linux:\numount /mnt/vast\nmount -t nfs -o vers=3,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard \\\n  ' + remoteIP + ':' + vPath + ' /mnt/vast\n\n# Update /etc/fstab and DNS to point to DR site VIP');

  out += '</div>';

  out += '<div class="doc-section">';

  out += h2('4. Unplanned Failover (Disaster Recovery)');

  out += warn('<strong>EMERGENCY:</strong> Only invoke when primary site is genuinely unreachable. May result in data loss up to last replication cycle (RPO = ' + rpoMin + ' min).');

  out += h3('4.1 Declare Disaster and Force Failover');

  out += cb('# STEP 1: Confirm primary is unrecoverable (check with DC ops team)\n\n# STEP 2: On DR CLUSTER at ' + remoteIP + ':\nvcli admin> protectedpath force-failover \\\n  --name "' + clN + '-data-snap"\n\n# WARNING: Breaks replication - resync needed after recovery\n# STEP 3: Verify data on DR site\nvcli admin> view list');

  out += h3('4.2 Client Re-mount at DR Site');

  out += cb('mount -t nfs -o vers=3,proto=tcp,nconnect=8,rsize=1048576,wsize=1048576,hard \\\n  ' + remoteIP + ':' + vPath + ' /mnt/vast\n\n# Kubernetes: Update VAST CSI VIP pool to DR site\n# VMware: Update NFS datastore IP in vCenter to ' + remoteIP);

  out += h3('4.3 Incident Record');

  out += cb('#   Disaster declared:    _________________ (UTC)\n#   DR services online:   _________________ (UTC)\n#   RTO achieved:         _________________ hours/minutes\n#   Data loss (RPO):      _________________ minutes\n#   Root cause:           _________________ (hardware/network/software/power)');

  out += '</div>';

  out += '<div class="doc-section">';

  out += h2('5. Failback Procedure');

  out += note('Failback after primary site is restored. Primary must be rebuilt/repaired first.');

  out += cb('# STEP 1: Restore primary infrastructure\n# STEP 2: Re-register primary as replication target from DR site\n\n# On DR cluster (current primary):\nvcli admin> remoteserver create \\\n  --name "' + clN + '-primary-recovered" \\\n  --mgmt-ip <PRIMARY-RECOVERED-IP>\n\n# STEP 3: Create reverse replication policy\nvcli admin> protectionpolicy create \\\n  --name "' + clN + '-failback-policy" \\\n  --frame "' + snapSchedVCLI + '" \\\n  --keep-local 7d --keep-remote 30d \\\n  --remote-server-name "' + clN + '-primary-recovered" \\\n  --remote-dir ' + vPath + '\n\n# STEP 4: Wait for sync, then perform planned failover back (Section 3)\n# STEP 5: Verify clients re-mounted to primary VIP ' + vipS);

  out += '</div>';

  out += '<div class="doc-section">';

  out += h2('6. Monthly DR Test (Non-Disruptive)');

  out += info('VAST recommends monthly DR tests. This procedure tests DR data accessibility without interrupting production.');

  out += cb('# List latest snapshots replicated to DR site:\nvcli admin> snapshot list --remote Yes\n\n# Mount latest snapshot as read-only test volume:\nvcli admin> view create \\\n  --name "dr-test-view" \\\n  --path ' + vPath + '/dr-test \\\n  --source-snapshot-name <LATEST-SNAPSHOT-NAME> \\\n  --policy-name "' + clN + '-nfs-policy" \\\n  --vip-pool-name "<DR-VIP-POOL>"\n\n# Mount from test client (read-only):\nmount -t nfs -o vers=3,nconnect=8,ro ' + remoteIP + ':' + vPath + '/dr-test /mnt/dr-test\nls -la /mnt/dr-test/\n\n# Clean up:\numount /mnt/dr-test\nvcli admin> view delete --name "dr-test-view"\n\n# Test Record:\n#   Test Date:             _________________\n#   Snapshot Age (vs RPO=' + rpoMin + 'min): _______\n#   Data Accessible:       PASS / FAIL\n#   Tested By:             _________________');

  out += '</div>';

  out += '<div class="doc-section">';

  out += h2('7. Escalation Contacts');

  out += '<table class="cabling-table"><thead><tr><th>Role</th><th>Name</th><th>Contact</th><th>Hours</th></tr></thead><tbody>';

  out += '<tr><td>VAST Data Support</td><td></td><td>support.vastdata.com</td><td>24/7</td></tr>';

  out += '<tr><td>VAST Solutions Engineer</td><td></td><td></td><td>Business hours + on-call</td></tr>';

  out += '<tr><td>Customer Storage Lead</td><td></td><td></td><td></td></tr>';

  out += '<tr><td>Customer IT Manager</td><td></td><td></td><td></td></tr>';

  out += '<tr><td>Customer NOC</td><td></td><td></td><td>24/7</td></tr>';

  out += '</tbody></table>';

  out += '</div>';

  out += '<div class="highlight-box" style="margin-top:2rem;">Document Control: Reviewed quarterly. Last reviewed: ' + date + '. Generated by VASTbuilder v2.0 &mdash; &copy; 2024&ndash;2026 Eugene Beauzec. All Rights Reserved.</div>';

  return out;

}



// ============================================================

// === SECTION 13: INIT ===

// ============================================================



async function initApp() {

  await DB.init();

  await loadCatalogFromCache(); // Load any previously fetched catalog before UI renders



  // Restore most-recently saved config from IndexedDB

  try {

    const configs = await DB.getAll('configs');

    if (configs.length > 0) {

      const latest = configs.sort((a,b) => new Date(b.modified)-new Date(a.modified))[0];

      AppState.config = Object.assign({}, AppState.config, latest);

      _populateFormsFromState();

    }

  } catch(e) { console.warn('Could not reload saved config:', e); }



  attachAllListeners();

  setupDropzone();

  calculateSizing();

  generateNetworkConfig();

  generateVcliCommands();

  updateSidebarProgress();

  updateKBStatus();

  await renderCheckpointsList();



  // Auto-save every 30 seconds

  AppState.autoSaveTimer = setInterval(() => saveConfig(), 30000);



  // Global keyboard shortcuts

  document.addEventListener('keydown', (e) => {

    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key==='z' && !e.shiftKey)  { e.preventDefault(); undo(); }

    if (mod && e.key==='y')                  { e.preventDefault(); redo(); }

    if (mod && e.key==='Z' && e.shiftKey)    { e.preventDefault(); redo(); }

    if (mod && e.key==='s')                  { e.preventDefault(); saveConfig(); showToast('Configuration auto-saved.','success'); }

    if (e.key==='Escape') {

      const p = document.getElementById('checkpoints-panel');

      if (p && p.classList.contains('open')) p.classList.remove('open');

    }

  });



  console.log('%cVAST Enterprise Architect v2.1 initialized.','color:#10B981;font-weight:700;font-size:14px;');

  console.log('%cVastOS '+_kbVer()+' | DASE CBOX+DBOX | RoCEv2/IB backends | 150+4 EC (2.67% overhead)','color:#38BDF8;');

}



document.addEventListener('DOMContentLoaded', initApp);

