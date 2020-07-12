# Enabling Memberships in this theme

Hey future Vikas, how you 'doin? It looks like you want to enable members on your blog, good for you! Here's what past Vikas did that you need to undo:

1. Rename `members` to `_members-data`

1. Move `assets/css/components/{buttons, forms}.css` to `_members-data`

1. Move `assets/css/ghost/members.css` to `_members-data`

1. Remove references to members components in `assets/css/screen.css`:

    a. @import "components/forms.css"; (after components/global.css)

    b. @import "components/buttons.css"; (after components/forms.css)

    c. @import "ghost/members.css"; (after components/readmore.css)