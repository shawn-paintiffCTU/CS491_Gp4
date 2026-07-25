-- Plethora of PIES!
-- Proposed PostgreSQL database schema. It is not connected to the current app.

-- Top-level groups such as Pizzas, Sides, and Drinks.
CREATE TABLE categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Products customers see on the menu.
CREATE TABLE menu_items (
    menu_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    image_path VARCHAR(255),
    is_customizable BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_menu_item_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
);

-- Price adjustments available in the pizza customizer.
CREATE TABLE pizza_sizes (
    size_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price_adjustment_cents INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE crusts (
    crust_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price_adjustment_cents INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Individual ingredients customers can add to a pizza.
CREATE TABLE toppings (
    topping_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Many-to-many link between menu pizzas and their included toppings.
CREATE TABLE menu_item_toppings (
    menu_item_id INTEGER NOT NULL,
    topping_id INTEGER NOT NULL,
    is_included BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (menu_item_id, topping_id),

    CONSTRAINT fk_item_topping_menu_item
        FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(menu_item_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_topping_topping
        FOREIGN KEY (topping_id)
        REFERENCES toppings(topping_id)
        ON DELETE RESTRICT
);

-- Indexes make common category and active-item lookups faster.
CREATE INDEX idx_menu_items_category
    ON menu_items(category_id);

CREATE INDEX idx_menu_items_active
    ON menu_items(is_active);

CREATE INDEX idx_toppings_active
    ON toppings(is_active);
