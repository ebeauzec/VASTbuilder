# VAST Enterprise Architecture & Configuration Tool

<div align="center">

![VAST Builder](https://img.shields.io/badge/VAST_AI_OS-5.5.0-10B981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01ek0yIDEybDEwIDUgMTAtNS0xMC01eiIvPjwvc3ZnPg==)
![License](https://img.shields.io/badge/License-Proprietary-EF4444?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.3.0-6366F1?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Browser--Native-F59E0B?style=for-the-badge)

**A fully browser-native, wizard-driven design and configuration tool for VAST Data Enterprise Storage — producing complete technical and commercial deliverables from a single guided session.**

[🚀 Open the Tool](#usage) · [📋 Features](#features) · [📚 Deliverables](#deliverables) · [⚙️ Architecture](#architecture) · [📄 License](#license)

</div>

---

> ⚠️ **Copyright Notice** — This software is proprietary. See [LICENSE](./LICENSE) for full terms. All rights reserved. © 2024–2026 Eugene Beauzec.

---

## Overview

The **VAST Enterprise Architecture & Configuration Tool (VASTbuilder)** is a self-contained, single-page web application that guides storage engineers, solutions architects, and sales engineers through a structured 10-stage wizard to produce a complete set of customer-ready deliverables for VAST Data storage deployments.

All logic runs entirely in the browser — no backend, no server, no cloud dependency. Configuration state is persisted locally via IndexedDB.

---

## Features

### 🧭 10-Stage Guided Wizard

| Stage | Panel | Content |
|-------|-------|---------|
| **Discovery** | 1 · Customer Profile | Organisation, contact, engagement type, region, SE/AE details |
| **Discovery** | 2 · Business Requirements | Use cases (multi-select), SLAs, compliance frameworks (HIPAA/GDPR/PCI/SOC2/FedRAMP), budget |
| **Discovery** | 3 · Workload Analysis | 8 multi-selectable workload presets, protocol mix, file size profile, GPU count, tier sliders |
| **Technical Design** | 4 · Architecture & Sizing | Real-time VAST sizing engine: C-node/D-node counts, rack/power/heat, growth projections |
| **Technical Design** | 5 · Network & Cabling | IP addressing, VLANs, dynamic SVG topology diagram, per-node port map, IP allocation table |
| **Technical Design** | 6 · Cluster Provisioning | VCLI command generator, VIP pool, protocols, authentication, QoS |
| **Technical Design** | 7 · Advanced Features | BC/DR replication, WAN sizing calculator, security (DARE/WORM/KMS), VMware/K8s/OpenStack |
| **Deliverables** | 8 · Design Proposal | Executive summary, solution overview, ROI calculator (3-year TCO) |
| **Deliverables** | 9 · Technical Deliverables | HLD, LLD, BOM, Firewall Port Matrix — all live-generated from wizard state |
| **Deliverables** | 10 · Deployment Package | Full VCLI runbook, Ansible playbooks, client mount guide, ATP, BC/DR runbook, handover checklist |

### 🔗 Full Wizard Interconnection Engine (v2.1)

Every field in every step drives all downstream steps in real-time:

| Change in | Drives |
|-----------|--------|
| **Step 1** — Industry | Step 2 compliance framework suggestion banner |
| **Step 2** — Use cases | Step 3 preset tiles highlighted as suggested |
| **Step 2** — RTO/RPO | Step 7 BC/DR replication type + RPO minutes |
| **Step 2** — Compliance | Step 7 DARE / WORM / audit log / Kerberos auto-enabled |
| **Step 3** — GPU count | Steps 4/5/6 NVMe/TCP, 100GbE, RoCEv2, switch model |
| **Step 3** — Cold tier % | Step 4 cold tiering auto-enabled |
| **Step 3** — Workloads | Protocol auto-selection in Steps 3 and 6 |
| **Step 4** — All sizing inputs | Live C/D-node counts, capacity tables, footprint, growth projections |
| **Step 4** — Sizing results | Step 5 VIP pool auto-sized, switches pre-selected, MTU recommended |
| **Step 7** — BC/DR RPO | Live WAN bandwidth requirement with pass/fail vs configured link |

### ⚙️ VAST Sizing Engine (v2.1)

Based on VAST Data public hardware specifications:

| Component | Spec Used |
|-----------|-----------|
| **Ceres C-Node** | 40 GB/s read, 20 GB/s write, 2U |
| **Ceres Pro C-Node** | 100 GB/s read (auto-selected when target >120 GB/s), 2U |
| **Voyager D-Node** | 1,920 TB raw QLC NVMe, 8 TB SCM buffers, 4U |
| **C-node sizing rule** | `max(readTP/40, writeTP/20, clients/200, GPUs/16, 3)` |
| **D-node sizing rule** | `ceil(rawTB / 1920)`, HA pairs enforced |
| **Power model** | 600 W/C-node, 3,500 W/D-node |
| **Erasure coding** | 150+4 (~2.67% overhead) |
| **Growth projections** | 1yr / 3yr / 5yr at configured annual growth rate |

### 🔧 Other Key Capabilities
- **50-deep undo/redo** with named checkpoint save/restore (IndexedDB)
- **Auto-save** every 30 seconds, JSON import/export
- **VCLI command generator** — paste-ready VAST CLI script from your inputs
- **Ansible playbook generator** — complete infrastructure-as-code deployment playbooks
- **Firewall port matrix** — auto-generated from your protocol selections
- **Product Catalog modal** — searchable hardware/software reference with latest specs
- **Knowledge base updater** — tracks current VastOS version and product data
- **Print-to-PDF** for all documents
- **Hot/Warm/Cold tier sliders** — always-linked, sum locked to 100%

---

## Deliverables Generated

### Panel 8 — Design Proposal
| Document | Contents |
|----------|----------|
| Executive Summary | Architecture overview, security posture, HA description, protocol list |
| Solution Overview | Detailed DASE architecture, component table, data reduction model, workload notes |
| ROI Calculator | 3-year TCO: current vs VAST, storage savings, staff savings, payback period |
| Live KB Update | Fetches `catalog.json` + CSI API from GitHub on demand; shows "What's New" modal with VastOS feature cards and clickable source links for every integration |

### Panel 9 — Technical Deliverables
| Document | Contents |
|----------|----------|
| High-Level Design (HLD) | Introduction, DASE overview, solution components table, network architecture, data protection, security, scalability, compliance in scope |
| Low-Level Design (LLD) | Cluster identity (name/DNS/NTP/syslog), full IP addressing table, switch configuration (PFC/ECN/VLAN), port map summary |
| Bill of Materials (BOM) | Line-item hardware (C-nodes, D-nodes, switches, cabling, racks), software licenses, support contracts with quantities |
| Firewall Port Matrix | All required ports with source/destination/service/direction for each protocol |

### Panel 10 — Deployment Package
| Document | Contents |
|----------|----------|
| VCLI Runbook | Full 8-phase CLI script: bootstrap, VIP, protocols, auth, views, QoS, replication, snapshots |
| Ansible Playbooks | `site.yml`, `inventory.yml`, `vastcluster` role, client NFS/SMB/S3/K8s deployment |
| Client Mount Guide | Optimised mount commands: NFSv3, NFSv4.1, SMB, S3, NVMe/TCP, Kubernetes PVC |
| Acceptance Test Plan (ATP) | Pre-acceptance checklist, sequential read/write FIO tests, random IOPS, protocol tests, resilience tests, sign-off table |
| BC/DR Runbook | DR overview table, monitoring, failover procedure, failback procedure, monthly test procedure |
| Handover Checklist | 50-point structured handover covering hardware, network, cluster, protocols, security, monitoring, documentation |

---

## Architecture

```
VASTbuilder/
├── index.html          # 10-panel wizard SPA + Interconnection Engine (3,500+ lines)
│   ├── Inline <script> — switchStep, navigateStep, updateAll(), _readCfg()
│   ├── Sizing Engine   — _computeSizing(), Ceres/Voyager specs
│   ├── Cascade Logic   — _cascadeIndustry/Compliance/Sla/Workload/Network
│   ├── Panel 5 Engine  — _rebuildCablingSVG(), _rebuildPortMap(), _rebuildIpAlloc()
│   └── Deliverables    — _buildInlineDeliverables() (HLD, LLD, BOM)
├── styles.css          # Dark glassmorphism design system (72KB)
├── app.js              # Full business logic engine (2,353 lines)
│   ├── Section 1:  IndexedDB persistence layer
│   ├── Section 2:  Product catalog (hardware/software data)
│   ├── Section 3:  Wizard navigation engine
│   ├── Section 4:  DASE sizing engine
│   ├── Section 5:  Network configuration engine
│   ├── Section 6:  VCLI command generator
│   ├── Section 7:  Document engine (HLD/LLD/BOM/ATP/BC-DR/Proposal)
│   ├── Section 8:  Export engine (JSON/CSV/TXT)
│   ├── Section 9:  Import engine (JSON restore)
│   ├── Section 10: Knowledge base / update engine
│   ├── Section 11: Checkpoint manager (undo/redo)
│   ├── Section 12: UI engine (modals/tabs/toasts)
│   └── Section 13: Init & event wiring
├── ansible/            # Exported Ansible playbooks (runtime-generated)
├── docs/               # Extended documentation
├── LICENSE             # Proprietary license
├── CHANGELOG.md        # Version history
├── SECURITY.md         # Security policy
└── README.md           # This file
```

### DASE Sizing Algorithm

```
Target Usable TB
  ÷ Data Reduction Ratio
  × 1.25 (overhead factor)
  = Raw TB Required

Raw TB Required
  ÷ 1,920 TB/D-Node (Voyager)
  = D-Node Count (min 4, HA pairs enforced)

Target Read GB/s ÷ 40 GB/s/C-Node = C-nodes (throughput)
Target Write GB/s ÷ 20 GB/s/C-Node = C-nodes (write)
Concurrent Clients ÷ 200 = C-nodes (client density)
GPU Count ÷ 16 = C-nodes (GPU workload)
→ C-Node Count = max(all above, 3)

[If target > 120 GB/s read → upgrade to Ceres Pro at 100 GB/s/node]

C-Node Count × 600W + D-Node Count × 3,500W = Total Power
C-Node Count × 2U + D-Node Count × 4U + Switches × 2U = Total Rack Units
```

---

## Usage

### Open Locally
```bash
# No installation required — open directly in Chrome, Edge, or Firefox
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

### Workflow
1. **Fill Panels 1–3** (Discovery) — as you fill in use-cases and compliance, Panels 3 and 7 auto-suggest matching configurations
2. **Fill Panel 4** — sizing targets; C/D-node counts, capacity, power, growth projections update in real-time
3. **Navigate to Panel 5** — cabling SVG, port map, and IP table auto-populate from your sizing
4. **Fill Panels 5–6** — network config; VCLI script generates automatically
5. **Configure Panel 7** — BC/DR WAN bandwidth calculator validates your link against RPO targets
6. **Navigate to Panels 8–10** — HLD, LLD, BOM, proposal, runbooks all generate from your wizard state

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save configuration |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Esc` | Close panels/modals |

---

## Browser Support
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 110+ | ✅ Fully supported |
| Edge | 110+ | ✅ Fully supported |
| Firefox | 115+ | ✅ Fully supported |
| Safari | 16+ | ⚠️ Mostly supported (minor IndexedDB quirks) |

> IndexedDB is required for save/checkpoint functionality. Incognito/Private mode may disable persistence.

---

## Technical References

The following official VAST Data documentation sources were used in building the product catalog, sizing algorithms, and configuration generators:

| Topic | Source |
|-------|--------|
| VAST DASE Architecture | [VAST Data Technical Overview](https://www.vastdata.com/technology) |
| VAST AI OS | [support.vastdata.com](https://support.vastdata.com) |
| VCLI Reference | VAST AI OS Administration Guide (requires support login) |
| VAST CSI Driver | [github.com/vast-data/vast-csi](https://github.com/vast-data/vast-csi) |
| VAST Mirror Replication | VAST AI OS Replication Guide |
| VMware Integration | VAST vSphere Integration Guide |
| OpenStack Integration | VAST Cinder/Manila Driver Guide |
| Kubernetes Storage | [OperatorHub VAST CSI](https://operatorhub.io/operator/vast-csi-operator) |
| VAST REST API | VAST Management API Reference |
| RoCEv2 Networking | VAST Network Design Guide |
| Arista EOS Config | [Arista EOS RDMA Guide](https://www.arista.com/en/support/toi/eos) |
| FIO Benchmarking | [github.com/axboe/fio](https://github.com/axboe/fio) |
| Ansible Storage | [Ansible Collections Index](https://docs.ansible.com/ansible/latest/collections/index.html) |

---

## VAST Data Product Reference (at time of publication)

### Compute Nodes (CBox)
| Model | CPU | RAM/Node | Network/Node | RU |
|-------|-----|----------|--------------|-----|
| VAST CBox (Standard) | AMD EPYC 9555P "Turin" 64-core | 384 GB DDR5-6400 | 4× 200GbE NDR | 2U/4-nodes |
| VAST CNode-X (GPU) | AMD EPYC 5th Gen | 4 TB DDR5 | 4× 200GbE NDR + 8× RTX PRO 6000 | 2U |

### Storage Nodes (DBox / Ceres / Voyager)
| Model | QLC Capacity | SCM Buffer | Total Raw | RU |
|-------|-------------|------------|-----------|-----|
| Ceres DF-3015V2 | 338 TB | 6.4 TB | 344 TB | 1U |
| Ceres DF-3060V2 | 1,352 TB | 12 TB | 1,364 TB | 1U |
| Voyager | 1,920 TB | 8 TB | 1,928 TB | 4U |

### Software
| Product | Version | Key Features |
|---------|---------|--------------|
| VAST AI OS | 5.4.1-SP4 (Latest) | DataEngine, DataBase Vector, AgentEngine, Kafka API, Polaris |

---

## Contributing

This is a proprietary project. External contributions are not accepted at this time. If you discover a security vulnerability, please report it via the [Security Policy](./SECURITY.md).

---

## Security

See [SECURITY.md](./SECURITY.md) for the security policy and responsible disclosure process.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## License

**Proprietary — All Rights Reserved.**

Copyright (c) 2024–2026 Eugene Beauzec. See [LICENSE](./LICENSE) for full terms.

This software may not be used commercially, redistributed, or incorporated into other products without express written consent from the author.

---

<div align="center">
Built with ❤️ for the VAST Data ecosystem.<br>
<sub>VAST Data® and VAST AI OS® are trademarks of VAST Data, Inc. This tool is not affiliated with or endorsed by VAST Data, Inc.</sub>
</div>
