import random

ACROSS = [
    (1, "BERITA"),
    (2, "JUDUL"),
    (3, "KAPAN"),
    (4, "SIAPA"),
    (5, "TERAS"),
    (6, "JURNALIS"),
    (7, "FAKTUAL"),
    (8, "NARASUMBER"),
    (9, "INOVASI"),
    (10, "VERIFIKASI"),
]

DOWN = [
    (11, "DIMANA"),
    (12, "MENGAPA"),
    (13, "BAGAIMANA"),
    (14, "TUBUH"),
    (15, "AKTUAL"),
    (16, "OBJEKTIF"),
    (17, "KUTIPAN"),
    (18, "DATA"),
    (19, "PROTOTIPE"),
    (20, "HOAKS"),
]

GRID_SIZE = 30

def can_place_across(grid, word, r, c):
    # Check bounds
    if c + len(word) > GRID_SIZE:
        return False
    # Check cell immediately before and after
    if c > 0 and grid[r][c-1] != ' ':
        return False
    if c + len(word) < GRID_SIZE and grid[r][c + len(word)] != ' ':
        return False

    for i, ch in enumerate(word):
        curr = grid[r][c + i]
        if curr != ' ' and curr != ch:
            return False
        # If placing in an empty cell, ensure row above and below are empty unless part of intersecting down word
        # (Standard crossword: no adjacent parallel words touching)
        # Specifically, if curr == ' ', check (r-1, c+i) and (r+1, c+i)
        if curr == ' ':
            if r > 0 and grid[r-1][c+i] != ' ':
                return False
            if r < GRID_SIZE - 1 and grid[r+1][c+i] != ' ':
                return False
    return True

def can_place_down(grid, word, r, c):
    if r + len(word) > GRID_SIZE:
        return False
    if r > 0 and grid[r-1][c] != ' ':
        return False
    if r + len(word) < GRID_SIZE and grid[r + len(word)][c] != ' ':
        return False

    for i, ch in enumerate(word):
        curr = grid[r + i][c]
        if curr != ' ' and curr != ch:
            return False
        if curr == ' ':
            if c > 0 and grid[r+i][c-1] != ' ':
                return False
            if c < GRID_SIZE - 1 and grid[r+i][c+1] != ' ':
                return False
    return True

def place_word(grid, word, r, c, is_across):
    cells = []
    for i, ch in enumerate(word):
        gr = r if is_across else r + i
        gc = c + i if is_across else c
        if grid[gr][gc] == ' ':
            grid[gr][gc] = ch
            cells.append((gr, gc))
    return cells

def unplace_word(grid, cells):
    for gr, gc in cells:
        grid[gr][gc] = ' '

def solve_crossword():
    # Sort words by length descending for better interlocking
    # Alternating across and down or backtracking
    # Let's run a search
    across_words = sorted(ACROSS, key=lambda x: len(x[1]), reverse=True)
    down_words = sorted(DOWN, key=lambda x: len(x[1]), reverse=True)

    # We can use a randomized restart search
    for attempt in range(5000):
        grid = [[' ' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
        placements = {} # id -> (r, c, direction)
        
        # Place first word in center
        w_id, word = across_words[0] # NARASUMBER
        r0, c0 = 10, 8
        place_word(grid, word, r0, c0, True)
        placements[w_id] = (r0, c0, 'across')

        # Try to place down words intersecting existing letters, then across words
        remaining_down = list(down_words)
        remaining_across = list(across_words[1:])

        success = True
        
        # Let's do a loop where we try to place unplaced words that intersect with placed words
        rounds = 0
        while (remaining_down or remaining_across) and rounds < 40:
            rounds += 1
            progress = False

            # Try down words
            random.shuffle(remaining_down)
            for d_item in list(remaining_down):
                d_id, d_word = d_item
                # Find all possible intersections with current grid
                candidates = []
                for i, d_ch in enumerate(d_word):
                    for r in range(GRID_SIZE):
                        for c in range(GRID_SIZE):
                            if grid[r][c] == d_ch:
                                # try placing down at (r - i, c)
                                start_r = r - i
                                if start_r >= 0 and can_place_down(grid, d_word, start_r, c):
                                    # count how many intersections this makes
                                    intersections = sum(1 for k in range(len(d_word)) if grid[start_r+k][c] == d_word[k])
                                    candidates.append((intersections, start_r, c))
                if candidates:
                    candidates.sort(key=lambda x: (x[0], random.random()), reverse=True)
                    best = candidates[0]
                    place_word(grid, d_word, best[1], best[2], False)
                    placements[d_id] = (best[1], best[2], 'down')
                    remaining_down.remove(d_item)
                    progress = True
                    break

            # Try across words
            random.shuffle(remaining_across)
            for a_item in list(remaining_across):
                a_id, a_word = a_item
                candidates = []
                for i, a_ch in enumerate(a_word):
                    for r in range(GRID_SIZE):
                        for c in range(GRID_SIZE):
                            if grid[r][c] == a_ch:
                                start_c = c - i
                                if start_c >= 0 and can_place_across(grid, a_word, r, start_c):
                                    intersections = sum(1 for k in range(len(a_word)) if grid[r][start_c+k] == a_word[k])
                                    candidates.append((intersections, r, start_c))
                if candidates:
                    candidates.sort(key=lambda x: (x[0], random.random()), reverse=True)
                    best = candidates[0]
                    place_word(grid, a_word, best[1], best[2], True)
                    placements[a_id] = (best[1], best[2], 'across')
                    remaining_across.remove(a_item)
                    progress = True
                    break

        if not remaining_down and not remaining_across:
            print(f"FOUND SOLUTION on attempt {attempt}!")
            return grid, placements

    print("Could not find complete solution with simple greedy restart.")
    return None, None

grid, placements = solve_crossword()
if grid:
    # Find bounding box
    min_r = min(r for r in range(GRID_SIZE) if any(grid[r][c] != ' ' for c in range(GRID_SIZE)))
    max_r = max(r for r in range(GRID_SIZE) if any(grid[r][c] != ' ' for c in range(GRID_SIZE)))
    min_c = min(c for c in range(GRID_SIZE) if any(grid[r][c] != ' ' for r in range(GRID_SIZE)))
    max_c = max(c for c in range(GRID_SIZE) if any(grid[r][c] != ' ' for r in range(GRID_SIZE)))
    
    print(f"Bounding box: rows {min_r} to {max_r} (height {max_r-min_r+1}), cols {min_c} to {max_c} (width {max_c-min_c+1})")
    
    # Normalize coordinates so min_r=0, min_c=0
    normalized_placements = {}
    for num, (r, c, d) in placements.items():
        normalized_placements[num] = (r - min_r, c - min_c, d)
        print(f"Word {num}: row={r - min_r}, col={c - min_c}, dir={d}")

    # Print grid
    for r in range(min_r, max_r + 1):
        line = "".join(grid[r][c] if grid[r][c] != ' ' else '.' for c in range(min_c, max_c + 1))
        print(f"{r-min_r:2d}: {line}")
