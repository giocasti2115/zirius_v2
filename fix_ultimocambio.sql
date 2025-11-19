DELIMITER $$

CREATE PROCEDURE UltimoCambio(IN p_orden_id INT)
BEGIN
    -- Actualizar el timestamp de la orden cuando hay cambios
    UPDATE ordenes 
    SET cierre = CURRENT_TIMESTAMP 
    WHERE id = p_orden_id;
END$$

DELIMITER ;