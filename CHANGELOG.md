# Changelog

All notable changes to the VAST Enterprise Architecture & Configuration Tool are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.1.0] — 2026-07-13

### Added

#### Central Interconnection Engine (`updateAll()`)
- Every form field in every panel now drives all downstream panels via a central `updateAll()` function
- `_readCfg()` — reads all 70+ form fields into a flat config object on every change
- `_computeSizing()` — VAST hardware sizing engine based on public specs:
  - **Ceres C-Node**: 40 GB/s read, 20 GB/s write, 2U per node
  - **Ceres Pro C-Node**: 100 GB/s read threshold (auto-selected at >120 GB/s target)
  - **Voyager D-Node**: 1,920 TB raw per chassis, 8 TB SCM buffers, 4U
  - C-node count = `max(throughput-driven, write-driven, clients/200, GPU/16, 3)`
  - D-node count = `ceil(rawTB / 1920)`, HA pairs enforced
  - Auto-calculates: switch count, fabric type, VIP pool size, growth projections (1/3/5yr), power/heat/footprint

#### Cross-Panel Cascade Logic
- **Step 1 → Step 2**: Industry selection surfaces compliance framework suggestions (amber hint banner — Healthcare → HIPAA/SOC2, Finance → PCI/SOC2, Government → FedRAMP, etc.)
- **Step 2 → Step 3**: Use-case checkboxes highlight matching preset tiles with amber suggested indicator
- **Step 2 → Step 7**: SLA RTO/RPO auto-sets BC/DR replication type and RPO minutes
- **Step 2 → Step 7**: Compliance checkboxes auto-enable DARE, WORM, audit logging, Kerberos, SMB signing
- **Step 3 → Steps 4/5/6**: GPU count auto-enables NVMe/TCP, sets 100GbE client network, RoCEv2 fabric
- **Step 3 → Step 4**: Cold tier % >30% auto-enables cold tiering; workload type auto-selects protocols
- **Step 4 → Step 5**: C-node count drives VIP pool size and auto-fills VIP start/end in both Panels 5 and 6
- **Step 4 → Step 5**: Performance targets auto-select switch model, fabric type, MTU 9000
- **Step 7 BC/DR**: Live WAN bandwidth calculator — RPO minutes + daily change rate → required Gbps with pass/fail indicator
- All cascades respect user overrides via `dataset.userSet` flag

#### Panel 5 — Fully Dynamic Network Topology
- **SVG Cabling Schematic** (`id="cabling-svg"`) — redrawn on every sizing change:
  - Correct number of C-nodes labeled with Ceres/Ceres Pro model
  - Correct number of D-nodes labeled with Voyager + capacity
  - Fabric switches with InfiniBand/RoCEv2 label
  - All cable paths redrawn: client switch → C-nodes, dual-rail C-nodes → switches, switches → D-nodes, OOB → all
  - `+N more` overflow indicator for clusters with >4 nodes per tier
  - Footer banner showing full configuration summary
- **Port Assignment Table** (`id="port-map-tbody"`) — generated per node:
  - C-nodes: eth0/eth1 (frontend), be0–be3 (Fabric A), be4–be7 (Fabric B, dual-rail), oob0 (BMC)
  - D-nodes: be0–be3 (Fabric A), be4–be7 (Fabric B), oob0 (BMC)
  - ISL inter-switch link entries
  - VLANs pulled from Panel 5 VLAN fields
- **IP Allocation Table** (`id="ip-alloc-tbody"`) — auto-allocated from subnet fields:
  - Management IPs counted from mgmt subnet per node
  - Backend IPs counted from backend subnet per node
  - VIP pool size derived from C-node count
  - Switch management IPs auto-placed after node range

#### Workload Preset & Use-Case Multi-Select
- Preset architecture tiles (Panel 3) now multi-selectable with toggle behaviour
- Use-case checkboxes (Panel 2) multi-selectable; each selection propagates downstream
- Preset tiles show amber `suggested` highlight when matching use-cases are checked in Panel 2

#### Hot/Warm/Cold Tier Sliders
- Linked sliders always sum to 100% — moving one redistributes the other two proportionally
- Live badge shows current total with green (100%) / red (<>100%) indicator

#### Inline Deliverables Engine (`_buildInlineDeliverables()`)
- Self-contained document generator reading live form state
- **HLD** — Architecture overview, DASE description, BOM summary table, full network design, capacity/performance table (with growth projections), security posture, compliance frameworks in scope
- **LLD** — Cluster identity (name, DNS, NTP, syslog), IP address plan table, switch configuration (PFC/ECN/VLAN), port map summary
- **BOM table** — line items: C-nodes, D-nodes, fabric switches, frontend switch, OOB switch, backend cables, client cables, OOB cables, racks, VAST OS license, 3-year support contract

### Changed
- `switchStep()` now triggers panel-specific generators on arrival:
  - n=5 → `generateNetworkConfig()`
  - n=6 → `generateVcliCommands()`
  - n=7 → `renderIntegrationConfigs()`
  - n≥8 → `_triggerDeliverables()` (tries app.js `generateAllDocuments()` first, inline fallback)
- `DOMContentLoaded` fires `_triggerDeliverables()` after 1200ms delay (after app.js `initApp()` completes)
- All form elements wired to `updateAll()` via `addEventListener` in DOMContentLoaded
- Panel 4 summary boxes now update in real-time from sizing engine

### Fixed
- Deliverables panels 8–10 were blank after clean_fix.py replaced the `switchStep` wrapper that originally called `generateAllDocuments()`
- Panel 5 SVG was a static 2-node diagram regardless of sizing configuration
- Port map and IP allocation tables were static placeholders
- Tier sliders (hot/warm/cold) were independent and could sum to values other than 100%
- BC/DR WAN bandwidth field had no calculated guidance

---

## [2.0.0] — 2026-07-13

### Added
- Complete 10-panel wizard architecture (replaces previous 6-panel design)
- Panel 1: Customer Profile — org, contact, SE/AE, engagement type, region, go-live date
- Panel 2: Business Requirements — use cases, SLA (RTO/RPO), compliance frameworks, budget
- Panel 3: Workload Analysis — 8 workload presets, protocol mix, GPU count, file profile
- Panel 4: Architecture & Sizing — live DASE sizing engine, rack/power/heat, growth projections
- Panel 5: Network & Cabling — IP addressing, VLANs, interactive SVG cabling diagram
- Panel 6: Cluster Provisioning — VCLI command generator, VIP pool, protocols, QoS
- Panel 7: Advanced Features — BC/DR, Security (DARE/WORM/KMIP), VMware/K8s/OpenStack integrations
- Panel 8: Design Proposal — Executive summary, solution overview, ROI calculator
- Panel 9: Technical Deliverables — HLD, LLD, BOM, Firewall Port Matrix (all auto-generated)
- Panel 10: Deployment Package — Full VCLI runbook, Ansible playbooks, ATP, BC/DR runbook, handover checklist
- IndexedDB persistence (save/load/auto-save every 30s)
- 50-deep undo/redo with named checkpoint system
- 8 workload presets with full parameter profiles (AI/ML, HPC, VMware, K8s, Backup, OpenStack, Media, Hybrid/DR)
- Product Catalog modal with CBox, DBox (Ceres DF-3015V2, DF-3060V2), EBox, 8 switch models, VastOS versions
- BOM generator with part numbers, quantities, rack/power calculations
- Full firewall port matrix auto-generated from protocol selections
- Comprehensive Ansible playbook set: inventory, site.yml, VAST cluster role, client roles
- _buildHLD(), _buildLLD(), _buildATP(), _buildBCDRRunbook(), _buildSolutionOverview() generators
- Knowledge base status display with last-checked date
- JSON config import/export with drag-and-drop
- Print-to-PDF for all documents
- Proprietary LICENSE and comprehensive README

### Changed
- Complete rewrite from v1.0 (6-panel static tool)
- DASE sizing algorithm updated for VAST AI OS 5.4.1-SP4 specs
- Dark glassmorphism design system (Outfit + JetBrains Mono fonts)
- Tab switchers rewritten to use CSS class-based approach (fixing display conflicts)
- Generator functions corrected to target proper HTML container IDs (-doc suffix)
- BOM table ID resolved (bom-tbody vs sizing-bom-tbody)

### Fixed
- All 17 missing `onclick` handler functions wired to JS engine
- `totalSteps` corrected from 6 to 10
- Workload preset key alignment between HTML `data-preset` and JS `PRODUCT_CATALOG`
- `switchPropTab`/`switchDelTab`/`switchDepTab` now use classList only (no inline display override)
- `showModal`/`hideModal` aligned with HTML inline modal style (`display:flex`)
- `exportFirewallMatrix` alias added pointing to `generateFirewallMatrix`
- Document generators now populate correct `-doc` suffix container IDs
- `generateProposal()` → `prop-content-executive-doc`
- `generateDeploymentGuide()` → `dep-content-runbook-doc`
- `_buildHLD()` → `del-content-hld-doc`
- `_buildLLD()` (new) → `del-content-lld-doc`
- `_buildATP()` → `dep-content-atp-doc`
- `_buildBCDRRunbook()` → `dep-content-bcdr-doc`

---

## [1.0.0] — 2024-06-01

### Added
- Initial 6-panel wizard: Customer, Sizing, Network, Provisioning, Deliverables, Export
- Basic DASE sizing calculations
- VCLI command generator (6-section)
- Static BOM table
- Dark theme design

---

*Copyright (c) 2024–2026 Eugene Beauzec. All Rights Reserved.*
