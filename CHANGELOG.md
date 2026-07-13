# Changelog

All notable changes to the VAST Enterprise Architecture & Configuration Tool are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
