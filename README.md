# VAST Enterprise Architecture & Configuration Tool

<div align="center">

![VAST Builder](https://img.shields.io/badge/VAST_AI_OS-5.4.1--SP4-10B981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01ek0yIDEybDEwIDUgMTAtNS0xMC01eiIvPjwvc3ZnPg==)
![License](https://img.shields.io/badge/License-Proprietary-EF4444?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-6366F1?style=for-the-badge)
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
| **Discovery** | 2 · Business Requirements | Use cases, SLAs, compliance frameworks (HIPAA/GDPR/PCI/SOC2/FedRAMP), budget |
| **Discovery** | 3 · Workload Analysis | 8 workload presets, protocol mix, file size profile, GPU count |
| **Technical Design** | 4 · Architecture & Sizing | DASE engine: CNode/DNode sizing, rack/power/heat, growth projections, cloud options |
| **Technical Design** | 5 · Network & Cabling | IP addressing, VLAN config, interactive SVG cabling diagram, port matrix |
| **Technical Design** | 6 · Cluster Provisioning | VCLI command generator, VIP pool, protocols, authentication, QoS |
| **Technical Design** | 7 · Advanced Features | BC/DR replication, security (DARE/WORM/KMS), VMware/K8s/OpenStack integrations |
| **Deliverables** | 8 · Design Proposal | Executive summary, solution overview, ROI calculator (3-year TCO) |
| **Deliverables** | 9 · Technical Deliverables | HLD, LLD, BOM, Firewall Port Matrix |
| **Deliverables** | 10 · Deployment Package | Full VCLI runbook, Ansible playbooks, client mount guide, ATP, BC/DR runbook, handover checklist |

### 🔧 Key Capabilities
- **Real-time DASE sizing engine** — Ceres DF-3015V2/DF-3060V2, EC overhead, SCM buffer, rack/power calculations
- **50-deep undo/redo** with named checkpoint save/restore (IndexedDB)
- **Auto-save** every 30 seconds, JSON import/export
- **8 workload presets** — AI/ML, HPC, VMware, K8s, Backup, OpenStack, Media/VFX, Hybrid DR
- **VCLI command generator** — paste-ready VAST CLI script from your inputs
- **Ansible playbook generator** — complete infrastructure-as-code deployment playbooks
- **Firewall port matrix** — auto-generated from your protocol selections
- **Product Catalog modal** — searchable hardware/software reference with latest specs
- **Knowledge base updater** — tracks current VastOS version and product data
- **Print-to-PDF** for all documents

---

## Deliverables Generated

### Panel 8 — Design Proposal
| Document | Contents |
|----------|----------|
| Executive Summary | Architecture overview, security posture, HA description, protocol list |
| Solution Overview | Detailed DASE architecture, component table, data reduction model, workload notes |
| ROI Calculator | 3-year TCO: current vs VAST, storage savings, staff savings, payback period |

### Panel 9 — Technical Deliverables
| Document | Contents |
|----------|----------|
| High-Level Design (HLD) | Introduction, DASE overview, solution components table, network architecture, data protection, security, scalability |
| Low-Level Design (LLD) | Hardware specs, full IP addressing table, switch configuration (PFC/ECN/VLAN), VAST cluster parameters |
| Bill of Materials (BOM) | Line-item hardware, cabling, rack, software with quantities and part notes |
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
├── index.html          # 10-panel wizard SPA (2,400+ lines)
├── styles.css          # Dark glassmorphism design system (710 lines)
├── app.js              # All business logic (2,200+ lines)
│   ├── Section 1:  IndexedDB persistence layer
│   ├── Section 2:  Product catalog (hardware/software data)
│   ├── Section 3:  Wizard navigation engine
│   ├── Section 4:  DASE sizing engine
│   ├── Section 5:  Network configuration engine
│   ├── Section 6:  VCLI command generator
│   ├── Section 7:  Document engine (HLD/LLD/BOM/ATP/BC-DR)
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
  = Physical On-Flash TB

Physical On-Flash TB
  ÷ (1 - EC Overhead)          [EC = 150+4 → 4/154 ≈ 2.597% overhead]
  = Raw SSD Required TB

Raw SSD Required TB
  + SCM Buffer (4% of Raw SSD)
  = Total Raw TB needed

Total Raw TB ÷ DBox Raw Capacity = DNode Count (rounded up, min 2)
DNode Count × 4 = Recommended CNode Count
CNode Count ÷ 4 = CBox Chassis Count (rounded up)
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
1. **Fill Panel 1–3** (Discovery) — customer details, requirements, workload profile
2. **Fill Panel 4** — adjust sizing targets; results update in real-time
3. **Fill Panel 5–6** — network config; VCLI script generates automatically
4. **Configure Panel 7** — BC/DR, security, integrations
5. **Navigate to Panels 8–10** — all documents generate automatically

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

### Storage Nodes (DBox / Ceres)
| Model | QLC Capacity | SCM Buffer | Total Raw | RU |
|-------|-------------|------------|-----------|-----|
| Ceres DF-3015V2 | 338 TB | 6.4 TB | 344 TB | 1U |
| Ceres DF-3060V2 | 1,352 TB | 12 TB | 1,364 TB | 1U |

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
