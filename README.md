# Admin System Requirements

## Question 1 []

- Create a super Admin route, when the super admin logs in, then he/she will be redirected to a "/routing-hub".
- **Hint:** On the layout file where the super-admin wishes to navigate allow the doorway to be opened for the role of super-admin as well.

## Question 2 []

- On the `/customer` for the sidebar profile image, when you click the pencil the modal that opens, I want you to add a background image that stands behind the image as in the image I've sent on the group. The customer must be able to upload a background image.

## Question 3 []

- For the `/customer` under the support in the sidebar create a messaging system, where a customer can send a message to admin with a title, their name, email and the actual support message.
- On the admin panel create a route for the admin sidebar that shows all the messages that came from a customer.

## Day 2

---

## Question 1 (CUSTOMER)

- [ ] On the customer route in the sidebar, there exists a label called `/settings`. This route does not exist yet. Create this settings route. This settings route will have **3 tabs**:  
  **[Personal Info, Checkout Details, Security].**

  **NB!** The **Personal Info** tab will be the default tab.

### 1. Personal Info  

Create a form that is pre-populated with the user's personal information. The fields that the customer should be able to update are:  

- `username`  
- `firstName`  
- `lastName`  
- `displayName`  
- `email`  
- `phoneNumber`  
- `address info`  

**Hint:** Use **Zod** for form validations.

---

### 2. Checkout Details  

For the **Checkout Details** tab:  

- Create a form where the user can set their order details.  
- Ensure that the data set in this form is pre-populated in the `/checkout` route whenever a customer places an order.  

**Important:** The following fields must **not** be pre-populated:  

1. **Branch**  
2. **Collection Method**  
3. **The agreed terms**  

**Hint:** Use **Zod** for form validations.

---

### 3. Security  

Create a form with the following inputs:  

1. **Current Password**  
2. **New Password**  
3. **Confirm New Password**  

- If the **current password** is incorrect, the **new password** cannot overwrite the existing password.  

**Hint:** Use **Zod** for form validations.

---

## Question 2 (EDITOR)

- [ ] On the Home page, there are **3 tabs**:  
  **New Arrivals, Best Sellers, and On Sale.**  

  The modal for creating a slider on these tabs already exists and is called `emptyslot`, which is a modal with an empty form.  

Each card in the tabs must have:  

1. A **pencil icon**.  
2. A **trash bin icon**.  

---

### 1. Pencil Icon  

- When the **pencil icon** is clicked, a modal should open with a form pre-populated with the data of that particular **unique ID**.  
- The editor will be able to update the payload (data) of that specific ID.

---

### 2. Trash Bin Icon  

- When the **trash bin icon** is clicked, a modal should open asking:  
  **"Are you sure you want to delete this slide? This action cannot be undone."**  
- Below this question, there must be **two buttons**:  
  `[Cancel]` `[Delete]`

---

### 3. "My Dashboard" Button  

- [ ] The **"My Dashboard"** button in the navbar must navigate to the appropriate route based on the user's role.  
  For example:  
  - If the session user is an **editor**, it must route to the **editor's dashboard**.  
  - If the session user is a **customer**, it must route to the **customer's dashboard**.  

---

### 4. Editor Route  

- [ ] After setting up the "My Dashboard" button routing, you will discover that the **editor route** doesn't exist yet.  
  - Create the **editor route** with a navbar containing a **user button** to allow the editor to log out of their dashboard.

---

### 5. Headwear, Apparel, and All Collections Routes  

- For the **Headwear**, **Apparel**, and **All Collections** routes:  
  - Create an **empty slot** at the top of the product cards and the filter sidebar.  
  - This slot will allow an editor to upload a banner for each collection.  

---

#### Banner Functionality

On the banner, there must be:

1. A **pencil icon**.  
2. A **trash bin icon**.

**Functionality:**  

- Clicking on either of these icons should open a modal.  
- Refer to the functionality described in **Question 2 → On the Home page there are 3 tabs** above.

[] On the Home page there is 3 tabs. New arrivals, best sellers and on sale. The create modal for the slider on the tabs already exist and is called emptyslot in other words this is a modal with an empty form. Now on each card in the tabs, each card must have there own pencil icon and there own trash bin.

1. When the pencil is clicked then a modal must open that has a form with the pre populated data of that particular unique id. On this model the editor will be able to update this id's payload(data).

2. When the trash bin is clicked a modal must open that ask the following question: Are you sure you want to delete this slide? This action cannot be undone.

   Below this question must be two buttons. [cancel] [delete].

[] For the my dashboard button in the navbar, the button must navigate to the route based in the users role. for example. if the session user is an editor then it must go to the editors dashboard. If its a customer then the customer must be re directed to the customer dashboard. This dashboard button will be setup for routing only for an editor a customer session.

[] After setting up the my dashboard button routing you will discover that the editor route doesn't exist yet. Setup the editor route just with a navbar that has the userbutton to allow the editor to log out of their dashboard.

[] For the Headwear, Apparel and All Collections route you will have to create a empty slot at the top of the product cards and the filter sidebar that allows an editor to upload a banner for each collection.

On this banner needs to be a pencil and a trash bin. The editor can open a modal when clicking one of the two icons. See this question [On the Home page there is 3 tabs. above] => This must be the same type of functionality.

:zipper_mouth_face:

---

### Example Table

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

---

### Graph Representation

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
