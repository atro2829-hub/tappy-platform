<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a confirmed Copilot action references a draft that no longer
 * exists or does not belong to the requesting user.
 */
class DraftNotFoundException extends RuntimeException {}
