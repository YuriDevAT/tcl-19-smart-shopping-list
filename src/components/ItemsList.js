import React from 'react';
import firebase from '../lib/firebase';
import Nav from './Nav';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const db = firebase.firestore().collection('shopping_list');

const wasItemPurchasedWithinLastOneDay = (lastPurchasedOn) => {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  return Date.now() - lastPurchasedOn <= oneDayInMilliseconds;
};

const ItemsList = () => {
  const userToken = localStorage.getItem('token');

  const [shoppingList, loading, error] = useCollectionData(
    db.where('token', '==', userToken),
    { idField: 'documentId' },
  );
  /*
   This uses the client's local time. If there is a time zone difference,
   it is likely to cause issues because a user can invite another person
   to join the shopping list.
  */
  const markItemAsPurchased = (index) => {
    const { items, documentId } = shoppingList[0];
    const shoppingListObject = items[index];

    if (shoppingListObject.lastPurchasedOn === null) {
      shoppingListObject.lastPurchasedOn = Date.now();
    } else {
      shoppingListObject.lastPurchasedOn = null;
    }

    items[index] = shoppingListObject;
    db.doc(documentId)
      .update({
        items: items,
        /*
        Research whether it is possible to update a single item within items array
        by inserting it at a particular index instead of updating entire array of 
        items
        */
      })
      .then(() => console.log('Successfully updated item'))
      .catch((e) => console.log('error', e));
  };
  return (
    <div>
      <h1>Your Shopping List</h1>
      <div>
        {loading && <p>Loading...</p>}
        {error && <p>An error has occured...</p>}
        {shoppingList && !shoppingList.length && (
          <p>You haven't created a shopping list yet...</p>
        )}
        <ul>
          {shoppingList &&
            shoppingList[0] &&
            shoppingList[0].items.map((shoppingItemObject, index) => {
              return (
                <li key={shoppingItemObject.shoppingListItemName + index}>
                  <label>
                    {shoppingItemObject.shoppingListItemName}
                    <input
                      type="checkbox"
                      onChange={() => markItemAsPurchased(index)}
                      checked={
                        shoppingItemObject.lastPurchasedOn === null
                          ? false
                          : wasItemPurchasedWithinLastOneDay(
                              shoppingItemObject.lastPurchasedOn,
                            )
                      }
                    />
                  </label>
                </li>
              );
            })}
        </ul>
      </div>
      <Nav />
    </div>
  );
};

export default ItemsList;
