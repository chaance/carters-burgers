# Carter's Burgers

Some fun with Astra DB, OpenAPI and Remix. And burgers!

To run this you will need an Astra DB account and a database. You can get a free
tier account at
[https://astra.datastax.com/register](https://astra.datastax.com/register).

You will also need to set some environment variables. Clone the `.env.example`
file to `.env` and fill in the values from your Astra DB account.

You will also need to create a database collection and populated it.

- You can create a collection in the DB by visiting the `/create-collection` route and completing the form.
- You can populate the collection by visiting the `/vectors` route. Click `Load
vectors` to generate some vector data based on a list of burger ingredients,
  then click `Insert vectors` to insert the data into the collection.

Your app should be ready to run! Enjoy the burgers 🍔
