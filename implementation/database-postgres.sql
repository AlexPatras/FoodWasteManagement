-- Create Table for 'user'
CREATE TABLE users(
    id SERIAL NOT NULL,
    first_name varchar(20) NOT NULL,
    last_name varchar(26)NOT NULL,
    phone_number integer NOT NULL,
    email varchar NOT NULL,
    verified boolean,
    donation_id varchar REFERENCES donations(id),
    chat_id varchar REFERENCES chats(id)
);

-- Create Table for 'company'
CREATE TABLE companies(
    id SERIAL NOT NULL,
    name varchar(32) NOT NULL ,
    phone_number varchar NOT NULL,
    email varchar NOT NULL,
    donation_id varchar REFERENCES donations(id),
    chat_id varchar REFERENCES chats(id)
);

-- Create Table for 'chats'
CREATE TABLE chats(
    id SERIAL NOT NULL,
    messages varchar NOT NULL REFERENCES messages(id),
    users varchar NOT NULL REFERENCES users(id)
);

-- Create Table for 'messages'
CREATE TABLE messages(
    id SERIAL NOT NULL,
    text varchar(128) NOT NULL,
    sender_id varchar NOT NULL REFERENCES users(id),
    chat_id varchar NOT NULL REFERENCES chats(id)
);


-- Create Table for 'donation'
CREATE TABLE donations(
    id SERIAL NOT NULL ,
    user_id varchar NOT NULL REFERENCES users(id),
    food_items varchar NOT NULL REFERENCES food_items(id)
);

-- Create Table for 'food_item'
CREATE TABLE food_items(
    id SERIAL NOT NULL,
    user_id varchar NOT NULL REFERENCES users(id),
    quantity integer NOT NULL,
    price integer NOT NULL,
    exp_date date NOT NULL
)
