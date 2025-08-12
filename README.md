Esta entrega final está aprobada con un 7 porque no está del todo completa debiado al muy escaso tiempo que pude dedicarle. Por obviedad, hubo errores e inconvenientes que pasé por alto y que debía corregir. Y poor supuesto, al no trabajarlo organizadamente, me terminé mareando en el proyecto.
Dejo aquí las corrección del profesor:

- la ruta /current en el router de vistas no está del todo bien. Pero es un detalle menor. Funciona. Algo que si está mal es que mantenes sessions, junto con jwt. Los sistemas de autenticación que no trabajan juntos. Debría ser uno o el otro.
- passport-local, bien. Incluso armaste el passportCall, de alguna forma. Así como lo tenes, no podes reutilizar, pero es correcto.
- el login no está claro. Se podría mejorar. Simplificar bastante. Además, al armar el token, y justo abajo, haces algo que podrías haber resuelto con un DTO. Que, para colmo, ya tenías armado. 
- middleware de autorizaciones por rol está correcto.
- modelo de capas, ídem: bien. 
- DAO: demasiado código en el de products, que es el que miré en detalle. Va solo el CRUD, y simple. Solo consultar o escribir en DB.
- El resto (validaciones, formateo de datos, etc.) va en el controller.
- por último, compra del cart: no la veo implementada, ¿puede ser? o está mal situada. 
Tenía que estar en /api/carts/:cid/purchase. 
