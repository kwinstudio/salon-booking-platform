# Salon Booking Platform — Recovery Build

Dit repository is de gecontroleerde recovery-lijn voor het salon booking & business management platform.

## Huidige status

- Recovery/security-module lokaal opnieuw gevalideerd: 18/18 tests PASS.
- Deze Render-deploy is bewust een recovery-statusbuild.
- De volledige eerder ontwikkelde booking/CRM/POS salon-app is nog niet volledig gereconstrueerd in deze repository.
- Geen productieklantdata of secrets worden in deze statusbuild gebruikt.

## Deployment

De publieke statusbuild wordt als Render Static Site gepubliceerd vanuit `public/`.
