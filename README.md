# Salon Booking Platform — Recovery SaaS

Dit repository bevat de huidige live recovery-build van het salon booking platform.

## Wat nu live werkt

- dashboard met dag-KPI's;
- agenda per datum;
- nieuwe afspraken toevoegen;
- overlap/conflictcontrole per medewerker;
- klantenoverzicht en klant toevoegen;
- diensten;
- team;
- wachtlijst;
- saloninstellingen;
- responsive mobiele navigatie;
- lokale browseropslag via localStorage.

## Belangrijke beperking

Dit is nog niet de uiteindelijke productie-SaaS. De live recovery-build gebruikt lokale browseropslag en heeft nog geen dedicated Supabase-productiedatabase, Auth of server-side multi-tenant booking engine gekoppeld.

## Test

```bash
npm test
```

De huidige repository bevat 4 dependency-free UI-contracttests. De uitgebreidere treatment-record/security recoverypatches bestaan nog in de lokale herstelworkspace en moeten in een volgende integratieronde naar deze repository worden teruggebracht en tegen een dedicated Supabase testomgeving worden uitgevoerd.

## Hosting

Render Static Site, branch `main`, publish directory `public/`.
