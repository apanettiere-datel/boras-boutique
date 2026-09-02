CREATE TABLE inventory (
  handle TEXT PRIMARY KEY,
  stock INTEGER NOT NULL
);

CREATE TABLE processed_orders (
  session_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO inventory (handle, stock) VALUES ('marigold-tiered-maxi', 4);
INSERT INTO inventory (handle, stock) VALUES ('wren-smocked-midi', 11);
INSERT INTO inventory (handle, stock) VALUES ('sanibel-floral-maxi', 18);
INSERT INTO inventory (handle, stock) VALUES ('juniper-cotton-slip', 7);
INSERT INTO inventory (handle, stock) VALUES ('naples-sunset-wrap-dress', 14);
INSERT INTO inventory (handle, stock) VALUES ('mangrove-eyelet-mini', 21);
INSERT INTO inventory (handle, stock) VALUES ('pelican-bay-linen-maxi', 10);
INSERT INTO inventory (handle, stock) VALUES ('gulfshore-tie-back-midi', 17);
INSERT INTO inventory (handle, stock) VALUES ('poppy-embroidered-blouse', 6);
INSERT INTO inventory (handle, stock) VALUES ('clementine-smocked-top', 13);
INSERT INTO inventory (handle, stock) VALUES ('fern-crochet-tank', 20);
INSERT INTO inventory (handle, stock) VALUES ('bayshore-puff-sleeve-top', 9);
INSERT INTO inventory (handle, stock) VALUES ('willow-linen-button-down', 16);
INSERT INTO inventory (handle, stock) VALUES ('coquina-ruffle-cami', 5);
INSERT INTO inventory (handle, stock) VALUES ('sawgrass-tie-front-top', 12);
INSERT INTO inventory (handle, stock) VALUES ('everglade-wide-leg-linen-pant', 19);
INSERT INTO inventory (handle, stock) VALUES ('tideline-denim-short', 8);
INSERT INTO inventory (handle, stock) VALUES ('vanderbilt-tiered-skirt', 15);
INSERT INTO inventory (handle, stock) VALUES ('seagrape-linen-set', 4);
INSERT INTO inventory (handle, stock) VALUES ('barefoot-gauze-set', 11);
INSERT INTO inventory (handle, stock) VALUES ('third-street-knit-set', 18);
INSERT INTO inventory (handle, stock) VALUES ('driftwood-cropped-cardigan', 7);
INSERT INTO inventory (handle, stock) VALUES ('sunday-market-linen-jacket', 14);
INSERT INTO inventory (handle, stock) VALUES ('raffia-slide-sandal', 21);
INSERT INTO inventory (handle, stock) VALUES ('espadrille-ankle-wrap', 10);
INSERT INTO inventory (handle, stock) VALUES ('palmetto-raffia-tote', 17);
INSERT INTO inventory (handle, stock) VALUES ('straw-wide-brim-hat', 6);
INSERT INTO inventory (handle, stock) VALUES ('shellwork-layering-necklace', 13);
INSERT INTO inventory (handle, stock) VALUES ('sunbeam-gold-hoop-trio', 20);
INSERT INTO inventory (handle, stock) VALUES ('tidepool-beaded-anklet-set', 9);
INSERT INTO inventory (handle, stock) VALUES ('cabana-stripe-one-piece', 16);
INSERT INTO inventory (handle, stock) VALUES ('sandbar-ribbed-bikini', 5);
