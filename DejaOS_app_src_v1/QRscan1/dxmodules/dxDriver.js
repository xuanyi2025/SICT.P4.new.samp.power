const dxDriver = {}

/*************************************Device Resource Enumeration*************************************/

/**
 * Device info
 */
dxDriver.DRIVER = {
    // Driver model
    MODEL:         "dw200"
}

/**
 * Display info
 */
/**
dxDriver.DISPLAY = {
    // Display width
    WIDTH:         320,
    // Display height
    HEIGHT:         480
}
 */
dxDriver.DISPLAY = {
    // Display width
    WIDTH:         480,
    // Display height
    HEIGHT:         320
}

/**
 * GPIO device pins
 */
dxDriver.GPIO = {

    // Relay
    RELAY:          35,
}

/**
 * Channel communication
 */
dxDriver.CHANNEL = {

    // 485       
    UART_PATH:      "/dev/ttyS3",
}

/**
 * Camera related parameters
 */
dxDriver.CAPTURER = {
    // Camera image width
	WIDTH:  800,
    // Camera image height
	HEIGHT:	600,
    // Camera device files
    PATH:  "/dev/video11"
}

/**
 * PWM channel
 */
dxDriver.PWM = {

    // Buzzer
    BUZZER_CHANNEL:         0
}


/**
 * GPIO pin function enumeration
 */
dxDriver.GPIO_FUNC = {
	GPIO_FUNC_3:    0x03,  //0011, GPIO as function 3 / device 3
	GPIO_OUTPUT0:   0x04,  //0100, GPIO output low  level
	GPIO_OUTPUT1:   0x05  //0101, GPIO output high level
};

dxDriver.HAL = {
    // HAL category configuration, used only within components
    DISPLAY: {
        // HAL display width
        HAL_WIDTH:         320,
        // HAL display height
        HAL_HEIGHT:         480,
        // HAL display rotation
        HAL_ROTATION:       1,
        // HAL display dpi
        HAL_DPI:         80
    }
}


export default dxDriver